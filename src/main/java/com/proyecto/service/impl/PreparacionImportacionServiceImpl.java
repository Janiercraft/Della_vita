package com.proyecto.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.Normalizador;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
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
                    "primerNombre",
                    "segundoNombre",
                    "primerApellido",
                    "segundoApellido",
                    "tipoDocumento",
                    "numeroDocumento",
                    "fechaNacimiento",
                    "celular",
                    "municipio",
                    "direccion");

    @Override
    @Transactional
    public Long preparar(
            String nombreArchivo, byte[] contenido, ConfiguracionImportacionDto configuracion) {
        if (contenido.length == 0 || contenido.length > 10 * 1024 * 1024) {
            throw ExcepcionNegocio.invalido(
                    "El archivo debe contener datos y pesar como maximo 10 MB");
        }
        if (nombreArchivo == null || nombreArchivo.length() > 255) {
            throw ExcepcionNegocio.invalido("Nombre de archivo invalido");
        }
        if (configuracion.getMapeo() == null
                || !configuracion.getMapeo().containsKey("primerNombre")
                || !configuracion.getMapeo().containsKey("primerApellido")) {
            throw ExcepcionNegocio.invalido("Mapee al menos primerNombre y primerApellido");
        }
        if (!CAMPOS.containsAll(configuracion.getMapeo().keySet())) {
            throw ExcepcionNegocio.invalido("El mapeo contiene campos no admitidos");
        }
        if (configuracion.getMapeo().values().stream()
                .anyMatch(valor -> valor == null || valor.isBlank())) {
            throw ExcepcionNegocio.invalido("El mapeo contiene encabezados vacios");
        }
        LectorArchivoService lectorSeleccionado = null;
        for (LectorArchivoService lector : lectores) {
            if (lector.soporta(nombreArchivo)) {
                lectorSeleccionado = lector;
                break;
            }
        }
        if (lectorSeleccionado == null) {
            throw ExcepcionNegocio.invalido(
                    "Formato no soportado: use CSV, XLSX o XLS. Otros origenes requieren un"
                            + " adaptador");
        }
        Map<String, Object> opciones = new TreeMap<>();
        opciones.put("mapeo", new TreeMap<>(configuracion.getMapeo()));
        opciones.put("separador", configuracion.getSeparador());
        opciones.put("hoja", configuracion.getHoja());
        opciones.put("contenido", huellaService.calcularBytes(contenido));
        String huella = huellaService.calcular(opciones);
        List<Map<String, String>> filas = lectorSeleccionado.leer(contenido, configuracion);
        if (filas.isEmpty()) {
            throw ExcepcionNegocio.invalido("El archivo no contiene filas de datos");
        }
        // Serializa altas de lotes y filas para evitar carreras entre importaciones concurrentes.
        controlRepository.bloquearProcesamiento();
        Optional<Importacion> anterior = importacionRepository.findByHuella(huella);
        if (anterior.isPresent()) {
            return anterior.get().getId();
        }
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
                configuracion
                        .getMapeo()
                        .forEach(
                                (campo, columna) ->
                                        valores.put(
                                                campo, Normalizador.texto(original.get(columna))));
                BeneficiarioDto dto = normalizar(valores);
                Set<ConstraintViolation<BeneficiarioDto>> errores = validator.validate(dto);
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
                fila.setMotivo(
                        error.getMessage()
                                .substring(0, Math.min(error.getMessage().length(), 2000)));
            }
            filaRepository.save(fila);
        }
        auditoriaService.registrar(
                "Importacion",
                importacion.getId(),
                "CARGAR",
                null,
                Map.of("filas", filas.size()),
                "Archivo preparado");
        log.info("Importacion preparada, id={}, filas={}", importacion.getId(), filas.size());
        return importacion.getId();
    }

    private BeneficiarioDto normalizar(Map<String, String> valores) {
        BeneficiarioDto dto = new BeneficiarioDto();
        dto.setPrimerNombre(valores.get("primerNombre"));
        dto.setSegundoNombre(valores.get("segundoNombre"));
        dto.setPrimerApellido(valores.get("primerApellido"));
        dto.setSegundoApellido(valores.get("segundoApellido"));
        dto.setTipoDocumento(
                Normalizador.texto(valores.get("tipoDocumento")) == null
                        ? null
                        : Normalizador.clave(valores.get("tipoDocumento")));
        dto.setNumeroDocumento(Normalizador.documento(valores.get("numeroDocumento")));
        dto.setCelular(valores.get("celular"));
        dto.setMunicipio(valores.get("municipio"));
        dto.setDireccion(valores.get("direccion"));
        if ((dto.getTipoDocumento() == null) != (dto.getNumeroDocumento() == null)) {
            throw ExcepcionNegocio.invalido(
                    "Informe tipo y numero de documento juntos o deje ambos vacios");
        }
        if (dto.getNumeroDocumento() != null
                && (!Normalizador.documentoValido(dto.getNumeroDocumento()))) {
            throw ExcepcionNegocio.invalido(
                    "Documento invalido; no utilice ceros ni textos como sin documento");
        }
        String fecha = valores.get("fechaNacimiento");
        if (fecha != null) {
            try {
                dto.setFechaNacimiento(LocalDate.parse(fecha));
            } catch (Exception error) {
                throw ExcepcionNegocio.invalido(
                        "fechaNacimiento debe usar AAAA-MM-DD; no se interpretan fechas ambiguas");
            }
        }
        return dto;
    }

    private String json(Object valor) {
        try {
            return mapper.writeValueAsString(valor);
        } catch (Exception error) {
            throw new IllegalStateException("No fue posible conservar la fila original");
        }
    }
}
