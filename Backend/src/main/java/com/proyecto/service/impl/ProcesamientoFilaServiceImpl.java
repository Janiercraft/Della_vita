package com.proyecto.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.Normalizador;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcesamientoFilaServiceImpl implements ProcesamientoFilaService {
    private static final String PROGRAMA_IMPORTACION = "ATENCIONES IMPORTADAS";

    private final FilaImportacionRepository filaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ControlImportacionRepository controlRepository;
    private final BeneficiarioService beneficiarioService;
    private final ProgramaRepository programaRepository;
    private final ParticipacionRepository participacionRepository;
    private final AtencionRepository atencionRepository;
    private final AuditoriaService auditoriaService;
    private final ObjectMapper mapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void procesar(Long idFila) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (!fila.getEstado().equals("NUEVO")) return;

        FilaImportacionNormalizadaDto datos = leer(fila);
        BeneficiarioDto dto = datos.getBeneficiario();

        if (dto.getNumeroDocumento() != null) {
            Optional<Beneficiario> existente = beneficiarioRepository.findByTipoDocumentoAndNumeroDocumento(
                    dto.getTipoDocumento(), dto.getNumeroDocumento());
            if (existente.isPresent()) {
                Beneficiario beneficiario = existente.get();
                Long idPrincipal = beneficiario.getIdBeneficiarioPrincipal() == null
                        ? beneficiario.getId() : beneficiario.getIdBeneficiarioPrincipal();
                fila.setIdBeneficiario(idPrincipal);
                if (contradice(dto, beneficiario)) {
                    fila.setCandidatos(beneficiario.getId().toString());
                    terminar(fila, "PENDIENTE",
                            "Documento existente con nombres incompatibles; requiere revision antes de vincular la atencion");
                } else {
                    if (tieneEvento(datos)) {
                        guardarAtencionImportada(fila, idPrincipal, datos);
                        terminar(fila, "VINCULADO",
                                "Beneficiario existente por documento; atencion de la fila vinculada sin duplicar la persona");
                    } else {
                        terminar(fila, "DUPLICADO",
                                "Mismo tipo y numero de documento; registro omitido sin modificar el existente");
                    }
                }
                return;
            }
        }

        List<Beneficiario> candidatos = buscarCandidatos(dto);
        if (!candidatos.isEmpty()) {
            fila.setCandidatos(candidatos.stream().map(c -> c.getId().toString()).collect(Collectors.joining(",")));
            terminar(fila, "PENDIENTE",
                    "Posible coincidencia por nombre; no se fusiona ni se descarta automaticamente");
            return;
        }

        BeneficiarioDto guardado = beneficiarioService.guardar(dto);
        fila.setIdBeneficiario(guardado.getId());
        guardarAtencionImportada(fila, guardado.getId(), datos);
        terminar(fila, "IMPORTADO", "Beneficiario creado y datos relacionados procesados correctamente");
    }

    private boolean tieneEvento(FilaImportacionNormalizadaDto datos) {
        return datos.getFechaAtencion() != null || StreamUtil.algunoConTexto(
                datos.getActividadRecibida(), datos.getResultadoAsociado(), datos.getTipoAtencion(),
                datos.getEstadoAtencion(), datos.getObservacionesAtencion());
    }

    private void guardarAtencionImportada(FilaImportacion fila, Long idBeneficiario, FilaImportacionNormalizadaDto datos) {
        if (!tieneEvento(datos)) return;

        if (datos.getFechaAtencion() == null || Normalizador.texto(datos.getTipoAtencion()) == null) {
            log.warn("Fila {} contiene datos de atencion pero no Fecha_atencion/Tipo_atencion_ayuda; se conserva en staging pero no se crea Atencion", fila.getNumeroFila());
            return;
        }

        String clave = "IMP-" + fila.getIdImportacion() + "-" + fila.getNumeroFila();
        if (atencionRepository.findByClaveIdempotencia(clave).isPresent()) return;

        Programa programa = programaRepository.findByNombre(PROGRAMA_IMPORTACION).orElseGet(() -> {
            Programa p = new Programa();
            p.setNombre(PROGRAMA_IMPORTACION);
            p.setLineaIntervencion("IMPORTACION");
            p.setDescripcion("Programa tecnico creado automaticamente para relacionar atenciones de archivos que no incluyen una columna de programa.");
            return programaRepository.saveAndFlush(p);
        });

        String periodo = Integer.toString(datos.getFechaAtencion().getYear());
        Participacion participacion = participacionRepository
                .findByIdBeneficiarioAndIdProgramaAndPeriodo(idBeneficiario, programa.getId(), periodo)
                .orElseGet(() -> {
                    Participacion p = new Participacion();
                    p.setIdBeneficiario(idBeneficiario);
                    p.setIdPrograma(programa.getId());
                    p.setPeriodo(periodo);
                    p.setFechaIngreso(datos.getFechaAtencion());
                    p.setEstadoParticipacion("EN_PROCESO");
                    p.setObservaciones("Participacion tecnica generada por importacion; el archivo fuente no contiene columna de programa.");
                    return participacionRepository.saveAndFlush(p);
                });

        Atencion atencion = new Atencion();
        atencion.setIdParticipacion(participacion.getId());
        atencion.setFechaAtencion(datos.getFechaAtencion());
        atencion.setTipoAtencion(Normalizador.texto(datos.getTipoAtencion()));
        atencion.setDescripcion(Normalizador.texto(datos.getActividadRecibida()));
        atencion.setResponsable(Normalizador.texto(datos.getOrganizacionResponsable()));
        atencion.setResultado(Normalizador.texto(datos.getResultadoAsociado()));
        atencion.setObservaciones(Normalizador.texto(datos.getObservacionesAtencion()));
        atencion.setEstadoAtencion(Normalizador.texto(datos.getEstadoAtencion()));
        atencion.setEstadoValidacionAyuda(determinarEstadoValidacion(datos.getTipoAtencion()));
        atencion.setClaveIdempotencia(clave);
        atencion.setHashSolicitud(sha256(fila.getNormalizados()));
        atencionRepository.saveAndFlush(atencion);
    }

    private String determinarEstadoValidacion(String tipoAtencion) {
        String tipo = Normalizador.clave(tipoAtencion);
        return tipo.contains("AYUDA") || tipo.contains("KIT") || tipo.contains("ENTREGA")
                ? "PENDIENTE" : "NO_APLICA";
    }

    private String sha256(String valor) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("No fue posible calcular la huella de la atencion importada", e);
        }
    }

    private boolean contradice(BeneficiarioDto dto, Beneficiario existente) {
        if (!Normalizador.clave(dto.getPrimerNombre()).equals(Normalizador.clave(existente.getPrimerNombre()))) return true;
        if (!Normalizador.clave(dto.getPrimerApellido()).equals(Normalizador.clave(existente.getPrimerApellido()))) return true;
        if (dto.getSegundoNombre() != null && existente.getSegundoNombre() != null
                && !Normalizador.clave(dto.getSegundoNombre()).equals(Normalizador.clave(existente.getSegundoNombre()))) return true;
        if (dto.getSegundoApellido() != null && existente.getSegundoApellido() != null
                && !Normalizador.clave(dto.getSegundoApellido()).equals(Normalizador.clave(existente.getSegundoApellido()))) return true;
        return dto.getFechaNacimiento() != null && existente.getFechaNacimiento() != null
                && !dto.getFechaNacimiento().equals(existente.getFechaNacimiento());
    }

    private List<Beneficiario> buscarCandidatos(BeneficiarioDto dto) {
        String nombre = Normalizador.clave(String.join(" ", dto.getPrimerNombre(),
                Objects.toString(dto.getSegundoNombre(), ""), dto.getPrimerApellido(),
                Objects.toString(dto.getSegundoApellido(), "")));
        List<Beneficiario> exactos = beneficiarioRepository.findTop20ByNombreNormalizadoOrderById(nombre);
        Map<Long, Beneficiario> candidatos = new LinkedHashMap<>();
        for (Beneficiario candidato : exactos) {
            if (dto.getNumeroDocumento() == null || candidato.getNumeroDocumento() == null) candidatos.put(candidato.getId(), candidato);
        }
        String inicio = nombre.substring(0, Math.min(3, nombre.length())) + "%";
        String apellido = "%" + Normalizador.clave(dto.getPrimerApellido()) + "%";
        List<Beneficiario> aproximados = beneficiarioRepository.buscarCandidatos(
                inicio, apellido, dto.getNumeroDocumento() == null,
                org.springframework.data.domain.PageRequest.of(0, 200));
        for (Beneficiario candidato : aproximados) {
            if (nombre.length() >= 6 && Normalizador.distancia(nombre, candidato.getNombreNormalizado()) <= 2) candidatos.put(candidato.getId(), candidato);
            if (candidatos.size() >= 20) break;
        }
        return new ArrayList<>(candidatos.values());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void marcarError(Long idFila, String motivo) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (fila.getEstado().equals("NUEVO")) terminar(fila, "ERROR", motivo);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resolver(Long idImportacion, Long idFila, ResolverFilaDto decision) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (!fila.getIdImportacion().equals(idImportacion)) throw ExcepcionNegocio.noEncontrado("Fila de esta importacion");
        if (!fila.getEstado().equals("PENDIENTE")) throw ExcepcionNegocio.conflicto("Solo se pueden resolver filas pendientes de revision");
        FilaImportacionNormalizadaDto datos = leer(fila);
        BeneficiarioDto dto = datos.getBeneficiario();
        switch (decision.getAccion()) {
            case "CREAR" -> {
                BeneficiarioDto nuevo = beneficiarioService.guardar(dto);
                fila.setIdBeneficiario(nuevo.getId());
                guardarAtencionImportada(fila, nuevo.getId(), datos);
                terminar(fila, "IMPORTADO", "Creacion autorizada: " + decision.getMotivo());
            }
            case "VINCULAR" -> {
                if (decision.getIdBeneficiario() == null) throw ExcepcionNegocio.invalido("Falta idBeneficiario");
                Beneficiario existente = beneficiarioRepository.findById(decision.getIdBeneficiario())
                        .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
                if (dto.getNumeroDocumento() != null && (!dto.getNumeroDocumento().equals(existente.getNumeroDocumento())
                        || !dto.getTipoDocumento().equals(existente.getTipoDocumento()))) {
                    throw ExcepcionNegocio.conflicto("No se puede vincular a un documento distinto; corrija primero la ficha");
                }
                Long idPrincipal = existente.getIdBeneficiarioPrincipal() == null ? existente.getId() : existente.getIdBeneficiarioPrincipal();
                fila.setIdBeneficiario(idPrincipal);
                guardarAtencionImportada(fila, idPrincipal, datos);
                terminar(fila, "VINCULADO", "Vinculacion autorizada: " + decision.getMotivo());
            }
            case "OMITIR" -> terminar(fila, "OMITIDO", "Omision autorizada: " + decision.getMotivo());
            default -> throw ExcepcionNegocio.invalido("Accion invalida");
        }
    }

    private void terminar(FilaImportacion fila, String estado, String motivo) {
        String estadoAnterior = fila.getEstado();
        fila.setEstado(estado);
        fila.setMotivo(motivo);
        filaRepository.saveAndFlush(fila);
        auditoriaService.registrar("FilaImportacion", fila.getId(), "PROCESAR", estadoAnterior, estado, motivo);
        log.info("Fila procesada, importacion={}, fila={}, resultado={}", fila.getIdImportacion(), fila.getNumeroFila(), estado);
    }

    private FilaImportacion obtener(Long idFila) {
        return filaRepository.findById(idFila).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Fila"));
    }

    private FilaImportacionNormalizadaDto leer(FilaImportacion fila) {
        try {
            return mapper.readValue(fila.getNormalizados(), FilaImportacionNormalizadaDto.class);
        } catch (Exception error) {
            throw new IllegalStateException("Datos temporales invalidos", error);
        }
    }

    private static final class StreamUtil {
        private StreamUtil() {}
        static boolean algunoConTexto(String... valores) {
            return Arrays.stream(valores).anyMatch(v -> v != null && !v.isBlank());
        }
    }
}
