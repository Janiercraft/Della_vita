package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ParticipacionServiceImpl implements ParticipacionService {
    private final ParticipacionRepository repository;
    private final AuditoriaService auditoriaService;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProgramaRepository programaRepository;
    private final ControlAccesoService controlAccesoService;

    @Override
    @Transactional
    public ParticipacionDto guardar(ParticipacionDto dto) {
        log.info("Iniciando registro de Participacion");

        validar(dto, null);
        Participacion registro = new Participacion();

        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Participacion",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Participacion guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public ParticipacionDto editar(Long id, ParticipacionDto dto) {
        log.info("Editando Participacion, id={}", id);
        Participacion registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        if (!Objects.equals(registro.getIdBeneficiario(), dto.getIdBeneficiario())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idBeneficiario de un registro existente; anule y cree"
                            + " otro");
        }
        if (!Objects.equals(registro.getIdPrograma(), dto.getIdPrograma())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idPrograma de un registro existente; anule y cree otro");
        }
        if (!Objects.equals(registro.getPeriodo(), dto.getPeriodo())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar periodo de un registro existente; anule y cree otro");
        }
        ParticipacionDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Participacion",
                id,
                "EDITAR",
                anterior,
                convertirADto(registro),
                "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public ParticipacionDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Participacion, id={}", id);
        Participacion registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        ParticipacionDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Participacion",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public ParticipacionDto consultar(Long id) {
        Participacion registro = obtener(id);
        controlAccesoService.validarBeneficiario(registro.getIdBeneficiario());
        return convertirADto(registro);
    }

    @Override
    public Page<ParticipacionDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Participacion> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Participacion obtener(Long id) {
        Optional<Participacion> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Participacion");
        }
        return registro.get();
    }

    private void comprobarVersion(Participacion registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(ParticipacionDto dto, Long id) {
        Optional<Beneficiario> consultarBeneficiario =
                beneficiarioRepository.findById(dto.getIdBeneficiario());
        if (consultarBeneficiario.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario");
        }
        if (!consultarBeneficiario.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Beneficiario esta inactivo");
        }
        controlAccesoService.validarMunicipio(consultarBeneficiario.get().getMunicipio());
        if (!"APROBADO".equals(consultarBeneficiario.get().getEstadoRevisionDuplicidad())) {
            throw ExcepcionNegocio.conflicto(
                    "El beneficiario esta en revision por duplicidad y no puede vincularse a programas");
        }
        if (controlAccesoService.esOperador()
                && !"OTORGADO".equals(consultarBeneficiario.get().getEstadoConsentimiento())) {
            throw ExcepcionNegocio.conflicto(
                    "El funcionario requiere consentimiento informado OTORGADO antes de vincular al beneficiario");
        }
        Optional<Programa> consultarPrograma = programaRepository.findById(dto.getIdPrograma());
        if (consultarPrograma.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Programa");
        }
        if (!consultarPrograma.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Programa esta inactivo");
        }

        Optional<Participacion> existente =
                repository.findByIdBeneficiarioAndIdProgramaAndPeriodo(
                        dto.getIdBeneficiario(),
                        dto.getIdPrograma(),
                        Normalizador.texto(dto.getPeriodo()));
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw ExcepcionNegocio.conflicto("Ya existe un registro con esa combinacion de datos");
        }
    }

    private void copiarCampos(ParticipacionDto dto, Participacion registro) {
        registro.setIdBeneficiario(dto.getIdBeneficiario());
        registro.setIdPrograma(dto.getIdPrograma());
        registro.setPeriodo(Normalizador.texto(dto.getPeriodo()));
        registro.setFechaIngreso(dto.getFechaIngreso());
        String estado = Normalizador.clave(dto.getEstadoParticipacion());
        registro.setEstadoParticipacion(estado.isBlank() ? "INSCRITO" : estado);
        registro.setObservaciones(Normalizador.texto(dto.getObservaciones()));
    }

    public ParticipacionDto convertirADto(Participacion registro) {
        ParticipacionDto dto = new ParticipacionDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setIdBeneficiario(registro.getIdBeneficiario());
        dto.setIdPrograma(registro.getIdPrograma());
        dto.setPeriodo(registro.getPeriodo());
        dto.setFechaIngreso(registro.getFechaIngreso());
        dto.setEstadoParticipacion(registro.getEstadoParticipacion());
        dto.setObservaciones(registro.getObservaciones());
        return dto;
    }
}
