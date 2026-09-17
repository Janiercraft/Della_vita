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

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcesamientoFilaServiceImpl implements ProcesamientoFilaService {
    private final FilaImportacionRepository filaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ControlImportacionRepository controlRepository;
    private final BeneficiarioService beneficiarioService;
    private final AuditoriaService auditoriaService;
    private final ObjectMapper mapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void procesar(Long idFila) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (!fila.getEstado().equals("NUEVO")) {
            return;
        }
        BeneficiarioDto dto = leer(fila);
        if (dto.getNumeroDocumento() != null) {
            Optional<Beneficiario> existente =
                    beneficiarioRepository.findByTipoDocumentoAndNumeroDocumento(
                            dto.getTipoDocumento(), dto.getNumeroDocumento());
            if (existente.isPresent()) {
                Beneficiario beneficiario = existente.get();
                fila.setIdBeneficiario(
                        beneficiario.getIdBeneficiarioPrincipal() == null
                                ? beneficiario.getId()
                                : beneficiario.getIdBeneficiarioPrincipal());
                if (contradice(dto, beneficiario)) {
                    fila.setCandidatos(beneficiario.getId().toString());
                    terminar(
                            fila,
                            "PENDIENTE",
                            "Documento existente con nombres o fecha de nacimiento contradictorios;"
                                    + " requiere revision");
                } else {
                    terminar(
                            fila,
                            "DUPLICADO",
                            "Mismo tipo y numero de documento; registro omitido sin modificar el"
                                    + " existente");
                }
                return;
            }
        }
        List<Beneficiario> candidatos = buscarCandidatos(dto);
        if (!candidatos.isEmpty()) {
            fila.setCandidatos(
                    candidatos.stream()
                            .map(candidato -> candidato.getId().toString())
                            .collect(Collectors.joining(",")));
            terminar(
                    fila,
                    "PENDIENTE",
                    "Posible coincidencia por nombre; no se fusiona ni se descarta"
                            + " automaticamente");
            return;
        }
        BeneficiarioDto guardado = beneficiarioService.guardar(dto);
        fila.setIdBeneficiario(guardado.getId());
        terminar(fila, "IMPORTADO", "Beneficiario creado correctamente");
    }

    private boolean contradice(BeneficiarioDto dto, Beneficiario existente) {
        if (!Normalizador.clave(dto.getPrimerNombre())
                .equals(Normalizador.clave(existente.getPrimerNombre()))) {
            return true;
        }
        if (!Normalizador.clave(dto.getPrimerApellido())
                .equals(Normalizador.clave(existente.getPrimerApellido()))) {
            return true;
        }
        if (dto.getSegundoNombre() != null
                && existente.getSegundoNombre() != null
                && !Normalizador.clave(dto.getSegundoNombre())
                        .equals(Normalizador.clave(existente.getSegundoNombre()))) {
            return true;
        }
        if (dto.getSegundoApellido() != null
                && existente.getSegundoApellido() != null
                && !Normalizador.clave(dto.getSegundoApellido())
                        .equals(Normalizador.clave(existente.getSegundoApellido()))) {
            return true;
        }
        return dto.getFechaNacimiento() != null
                && existente.getFechaNacimiento() != null
                && !dto.getFechaNacimiento().equals(existente.getFechaNacimiento());
    }

    private List<Beneficiario> buscarCandidatos(BeneficiarioDto dto) {
        String nombre =
                Normalizador.clave(
                        String.join(
                                " ",
                                dto.getPrimerNombre(),
                                Objects.toString(dto.getSegundoNombre(), ""),
                                dto.getPrimerApellido(),
                                Objects.toString(dto.getSegundoApellido(), "")));
        List<Beneficiario> exactos =
                beneficiarioRepository.findTop20ByNombreNormalizadoOrderById(nombre);
        Map<Long, Beneficiario> candidatos = new LinkedHashMap<>();
        for (Beneficiario candidato : exactos) {
            if (dto.getNumeroDocumento() == null || candidato.getNumeroDocumento() == null) {
                candidatos.put(candidato.getId(), candidato);
            }
        }
        String inicio = nombre.substring(0, Math.min(3, nombre.length())) + "%";
        String apellido = "%" + Normalizador.clave(dto.getPrimerApellido()) + "%";
        List<Beneficiario> aproximados =
                beneficiarioRepository.buscarCandidatos(
                        inicio,
                        apellido,
                        dto.getNumeroDocumento() == null,
                        org.springframework.data.domain.PageRequest.of(0, 200));
        for (Beneficiario candidato : aproximados) {
            // Regla conservadora y explicable: dos ediciones como maximo en el nombre completo.
            if (nombre.length() >= 6
                    && Normalizador.distancia(nombre, candidato.getNombreNormalizado()) <= 2) {
                candidatos.put(candidato.getId(), candidato);
            }
            if (candidatos.size() >= 20) {
                break;
            }
        }
        return new ArrayList<>(candidatos.values());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void marcarError(Long idFila, String motivo) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (fila.getEstado().equals("NUEVO")) {
            terminar(fila, "ERROR", motivo);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resolver(Long idImportacion, Long idFila, ResolverFilaDto decision) {
        controlRepository.bloquearProcesamiento();
        FilaImportacion fila = obtener(idFila);
        if (!fila.getIdImportacion().equals(idImportacion)) {
            throw ExcepcionNegocio.noEncontrado("Fila de esta importacion");
        }
        if (!fila.getEstado().equals("PENDIENTE")) {
            throw ExcepcionNegocio.conflicto(
                    "Solo se pueden resolver filas pendientes de revision");
        }
        BeneficiarioDto dto = leer(fila);
        switch (decision.getAccion()) {
            case "CREAR":
                BeneficiarioDto nuevo = beneficiarioService.guardar(dto);
                fila.setIdBeneficiario(nuevo.getId());
                terminar(fila, "IMPORTADO", "Creacion autorizada: " + decision.getMotivo());
                break;
            case "VINCULAR":
                if (decision.getIdBeneficiario() == null) {
                    throw ExcepcionNegocio.invalido("Falta idBeneficiario");
                }
                Optional<Beneficiario> consultar =
                        beneficiarioRepository.findById(decision.getIdBeneficiario());
                if (consultar.isEmpty()) {
                    throw ExcepcionNegocio.noEncontrado("Beneficiario");
                }
                Beneficiario existente = consultar.get();
                if (dto.getNumeroDocumento() != null
                        && (!dto.getNumeroDocumento().equals(existente.getNumeroDocumento())
                                || !dto.getTipoDocumento().equals(existente.getTipoDocumento()))) {
                    throw ExcepcionNegocio.conflicto(
                            "No se puede vincular a un documento distinto o ausente; corrija"
                                    + " primero la ficha");
                }
                fila.setIdBeneficiario(
                        existente.getIdBeneficiarioPrincipal() == null
                                ? existente.getId()
                                : existente.getIdBeneficiarioPrincipal());
                terminar(
                        fila,
                        "VINCULADO",
                        "Vinculacion autorizada, sin sobrescribir la ficha: "
                                + decision.getMotivo());
                break;
            case "OMITIR":
                terminar(fila, "OMITIDO", "Omision autorizada: " + decision.getMotivo());
                break;
            default:
                throw ExcepcionNegocio.invalido("Accion invalida");
        }
    }

    private void terminar(FilaImportacion fila, String estado, String motivo) {
        String estadoAnterior = fila.getEstado();
        fila.setEstado(estado);
        fila.setMotivo(motivo);
        filaRepository.saveAndFlush(fila);
        auditoriaService.registrar(
                "FilaImportacion", fila.getId(), "PROCESAR", estadoAnterior, estado, motivo);
        log.info(
                "Fila procesada, importacion={}, fila={}, resultado={}",
                fila.getIdImportacion(),
                fila.getNumeroFila(),
                estado);
    }

    private FilaImportacion obtener(Long idFila) {
        Optional<FilaImportacion> fila = filaRepository.findById(idFila);
        if (fila.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Fila");
        }
        return fila.get();
    }

    private BeneficiarioDto leer(FilaImportacion fila) {
        try {
            return mapper.readValue(fila.getNormalizados(), BeneficiarioDto.class);
        } catch (Exception error) {
            throw new IllegalStateException("Datos temporales invalidos");
        }
    }
}
