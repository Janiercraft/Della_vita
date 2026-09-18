package com.proyecto.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.MapeoColumnasImportacion;
import com.proyecto.util.Normalizador;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreparacionImportacionServiceImpl implements PreparacionImportacionService {
    private final List<LectorArchivoService> lectores;
    private final ImportacionRepository importacionRepository;
    private final FilaImportacionRepository filaRepository;
    private final ControlImportacionRepository controlRepository;
    private final HuellaService huellaService;
    private final AuditoriaService auditoriaService;
    private final ObjectMapper mapper;
    private final Validator validator;

    private static final Set<String> CAMPOS =
            Set.of(
                    "primerNombre", "segundoNombre", "primerApellido", "segundoApellido",
                    "tipoDocumento", "numeroDocumento", "fechaNacimiento", "celular",
                    "municipio", "direccion", "codigoOrigen", "nombreCompleto", "sexo", "edad",
                    "zona", "nacionalidad", "tipoPoblacion", "organizacionOrigen",
                    "fechaRegistroOrigen", "actividadRecibida", "resultadoAsociado",
                    "fechaAtencion", "tipoAtencion", "estadoAtencion", "observacionesAtencion");

    @Override
    @Transactional
    public Long preparar(
            String nombreArchivo, byte[] contenido, ConfiguracionImportacionDto configuracion) {
        if (contenido.length == 0 || contenido.length > 10 * 1024 * 1024) {
            throw ExcepcionNegocio.invalido("El archivo debe contener datos y pesar como maximo 10 MB");
        }
        if (nombreArchivo == null || nombreArchivo.length() > 255) {
            throw ExcepcionNegocio.invalido("Nombre de archivo invalido");
        }
        if (configuracion == null) {
            configuracion = ConfiguracionImportacionDto.builder().separador("AUTO").hoja(0).build();
        }
        if (configuracion.getMapeo() == null) {
            configuracion.setMapeo(new LinkedHashMap<>());
        }
        if (!CAMPOS.containsAll(configuracion.getMapeo().keySet())) {
            throw ExcepcionNegocio.invalido("El mapeo contiene campos no admitidos");
        }
        if (configuracion.getMapeo().values().stream().anyMatch(v -> v == null || v.isBlank())) {
            throw ExcepcionNegocio.invalido("El mapeo contiene encabezados vacios");
        }

        LectorArchivoService lector = seleccionarLector(nombreArchivo);
        List<Map<String, String>> filas = lector.leer(contenido, configuracion);
        if (filas.isEmpty()) {
            throw ExcepcionNegocio.invalido("El archivo no contiene filas de datos");
        }

        List<String> encabezados = filas.getFirst().keySet().stream()
                .filter(k -> !k.startsWith("__"))
                .toList();
        Map<String, String> mapeo = new LinkedHashMap<>(MapeoColumnasImportacion.detectar(encabezados));
        // El mapeo manual siempre tiene prioridad sobre el automatico.
        mapeo.putAll(configuracion.getMapeo());
        validarMapeoMinimo(mapeo);
        configuracion.setMapeo(mapeo);

        Map<String, Object> opciones = new TreeMap<>();
        opciones.put("mapeo", new TreeMap<>(mapeo));
        opciones.put("derivados", MapeoColumnasImportacion.derivados());
        opciones.put("separador", configuracion.getSeparador());
        opciones.put("hoja", configuracion.getHoja());
        opciones.put("contenido", huellaService.calcularBytes(contenido));
        String huella = huellaService.calcular(opciones);

        controlRepository.bloquearProcesamiento();
        Optional<Importacion> anterior = importacionRepository.findByHuella(huella);
        if (anterior.isPresent()) return anterior.get().getId();

        Importacion importacion = new Importacion();
        importacion.setNombreArchivo(nombreArchivo);
        importacion.setHuella(huella);
        importacion.setFecha(Instant.now());
        importacion.setUsuario(RegistroAuditable.usuarioActual());
        importacion.setConfiguracion(json(opciones));
        importacionRepository.saveAndFlush(importacion);

        int numeroFila = 2;
        for (Map<String, String> original : filas) {
            FilaImportacion fila = new FilaImportacion();
            fila.setIdImportacion(importacion.getId());
            fila.setNumeroFila(numeroFila++);
            fila.setOriginales(json(original));
            fila.setNormalizados("{}");
            fila.setEstado("NUEVO");
            fila.setMotivo("Pendiente de procesamiento");
            try {
                if (original.containsKey("__error")) {
                    throw ExcepcionNegocio.invalido(original.get("__error"));
                }
                Map<String, String> valores = new LinkedHashMap<>();
                mapeo.forEach((campo, columna) -> valores.put(campo, Normalizador.texto(original.get(columna))));
                FilaImportacionNormalizadaDto dto = normalizar(valores);
                Set<ConstraintViolation<BeneficiarioDto>> errores = validator.validate(dto.getBeneficiario());
                if (!errores.isEmpty()) {
                    List<String> mensajes = new ArrayList<>();
                    for (ConstraintViolation<BeneficiarioDto> error : errores) {
                        mensajes.add(error.getPropertyPath() + ": " + error.getMessage());
                    }
                    Collections.sort(mensajes);
                    throw ExcepcionNegocio.invalido(String.join("; ", mensajes));
                }
                fila.setNormalizados(json(dto));
            } catch (ExcepcionNegocio error) {
                fila.setEstado("ERROR");
                fila.setMotivo(error.getMessage().substring(0, Math.min(error.getMessage().length(), 2000)));
            }
            filaRepository.save(fila);
        }

        auditoriaService.registrar(
                "Importacion", importacion.getId(), "CARGAR", null,
                Map.of("filas", filas.size(), "mapeoAutomatico", mapeo),
                "Archivo preparado con deteccion automatica de columnas");
        log.info("Importacion preparada, id={}, filas={}, mapeo={}", importacion.getId(), filas.size(), mapeo);
        return importacion.getId();
    }

    private void validarMapeoMinimo(Map<String, String> mapeo) {
        boolean nombreCompleto = mapeo.containsKey("nombreCompleto");
        boolean separado = mapeo.containsKey("primerNombre") && mapeo.containsKey("primerApellido");
        if (!nombreCompleto && !separado) {
            throw ExcepcionNegocio.invalido(
                    "No fue posible identificar Nombre_completo ni primerNombre/primerApellido. Puede enviar un mapeo manual.");
        }
    }

    private LectorArchivoService seleccionarLector(String nombreArchivo) {
        return lectores.stream().filter(l -> l.soporta(nombreArchivo)).findFirst()
                .orElseThrow(() -> ExcepcionNegocio.invalido("Formato no soportado: use CSV, XLSX o XLS"));
    }

    private FilaImportacionNormalizadaDto normalizar(Map<String, String> valores) {
        BeneficiarioDto dto = new BeneficiarioDto();
        String nombreCompleto = Normalizador.texto(valores.get("nombreCompleto"));
        if (nombreCompleto != null) {
            asignarNombreCompleto(dto, nombreCompleto);
            dto.setNombreCompletoOriginal(nombreCompleto);
        } else {
            dto.setPrimerNombre(valores.get("primerNombre"));
            dto.setSegundoNombre(valores.get("segundoNombre"));
            dto.setPrimerApellido(valores.get("primerApellido"));
            dto.setSegundoApellido(valores.get("segundoApellido"));
        }

        dto.setTipoDocumento(claveNullable(valores.get("tipoDocumento")));
        dto.setNumeroDocumento(Normalizador.documento(valores.get("numeroDocumento")));
        dto.setCelular(valores.get("celular"));
        dto.setMunicipio(valores.get("municipio"));
        dto.setDireccion(valores.get("direccion"));
        dto.setCodigoOrigen(valores.get("codigoOrigen"));
        dto.setSexo(valores.get("sexo"));
        dto.setEdad(parseEdad(valores.get("edad")));
        dto.setZona(valores.get("zona"));
        dto.setNacionalidad(valores.get("nacionalidad"));
        dto.setTipoPoblacion(valores.get("tipoPoblacion"));
        dto.setOrganizacionOrigen(valores.get("organizacionOrigen"));
        dto.setFechaRegistroOrigen(parseFecha(valores.get("fechaRegistroOrigen"), "Fecha_registro"));
        dto.setFechaNacimiento(parseFecha(valores.get("fechaNacimiento"), "fechaNacimiento"));

        if ((dto.getTipoDocumento() == null) != (dto.getNumeroDocumento() == null)) {
            throw ExcepcionNegocio.invalido("Informe tipo y numero de documento juntos o deje ambos vacios");
        }
        if (dto.getNumeroDocumento() != null && !Normalizador.documentoValido(dto.getNumeroDocumento())) {
            throw ExcepcionNegocio.invalido("Documento invalido; no utilice ceros ni textos como sin documento");
        }

        return FilaImportacionNormalizadaDto.builder()
                .beneficiario(dto)
                .actividadRecibida(valores.get("actividadRecibida"))
                .resultadoAsociado(valores.get("resultadoAsociado"))
                .fechaAtencion(parseFecha(valores.get("fechaAtencion"), "Fecha_atencion"))
                .tipoAtencion(valores.get("tipoAtencion"))
                .estadoAtencion(valores.get("estadoAtencion"))
                .observacionesAtencion(valores.get("observacionesAtencion"))
                .organizacionResponsable(valores.get("organizacionOrigen"))
                .build();
    }

    private void asignarNombreCompleto(BeneficiarioDto dto, String nombre) {
        String[] p = nombre.trim().replaceAll("\\s+", " ").split(" ");
        if (p.length < 2) {
            throw ExcepcionNegocio.invalido("Nombre_completo debe contener al menos nombre y apellido");
        }
        dto.setPrimerNombre(p[0]);
        if (p.length == 2) {
            dto.setPrimerApellido(p[1]);
            return;
        }
        if (p.length == 3) {
            dto.setPrimerApellido(p[1]);
            dto.setSegundoApellido(p[2]);
            return;
        }
        dto.setSegundoNombre(String.join(" ", Arrays.copyOfRange(p, 1, p.length - 2)));
        dto.setPrimerApellido(p[p.length - 2]);
        dto.setSegundoApellido(p[p.length - 1]);
    }

    private Integer parseEdad(String valor) {
        if (Normalizador.texto(valor) == null) return null;
        try {
            int edad = (int) Double.parseDouble(valor.replace(',', '.'));
            if (edad < 0 || edad > 130) throw new NumberFormatException();
            return edad;
        } catch (NumberFormatException e) {
            throw ExcepcionNegocio.invalido("Edad debe ser un numero entre 0 y 130");
        }
    }

    private LocalDate parseFecha(String valor, String campo) {
        if (Normalizador.texto(valor) == null) return null;
        List<DateTimeFormatter> formatos = List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("d/M/uuuu"),
                DateTimeFormatter.ofPattern("d-M-uuuu"));
        for (DateTimeFormatter f : formatos) {
            try { return LocalDate.parse(valor.trim(), f); } catch (DateTimeParseException ignored) {}
        }
        throw ExcepcionNegocio.invalido(campo + " debe usar AAAA-MM-DD, DD/MM/AAAA o DD-MM-AAAA");
    }

    private String claveNullable(String valor) {
        return Normalizador.texto(valor) == null ? null : Normalizador.clave(valor);
    }

    private String json(Object valor) {
        try { return mapper.writeValueAsString(valor); }
        catch (Exception error) { throw new IllegalStateException("No fue posible conservar la fila original"); }
    }
}
