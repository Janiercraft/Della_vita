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
public class SeguimientoServiceImpl implements SeguimientoService {
    private final SeguimientoRepository repository;
    private final AuditoriaService auditoriaService;
    private final ParticipacionRepository participacionRepository;
    private final HuellaService huellaService;
    private final ControlAccesoService controlAccesoService;

    @Override
    @Transactional
    public SeguimientoDto guardar(SeguimientoDto dto, String claveIdempotencia) {
        log.info("Iniciando registro de Seguimiento");

        if (claveIdempotencia == null || !claveIdempotencia.matches("[A-Za-z0-9_-]{8,100}")) {
            throw ExcepcionNegocio.invalido(
                    "Idempotency-Key debe tener de 8 a 100 letras, numeros, guiones o guiones"
                            + " bajos");
        }
        String hashSolicitud = huellaService.calcular(dto);
        Optional<Seguimiento> solicitudAnterior =
                repository.findByClaveIdempotencia(claveIdempotencia);
        if (solicitudAnterior.isPresent()) {
            if (!solicitudAnterior.get().getHashSolicitud().equals(hashSolicitud)) {
                throw ExcepcionNegocio.conflicto(
                        "La clave de idempotencia ya se utilizo con otros datos");
            }
            return convertirADto(solicitudAnterior.get());
        }
        validar(dto, null);
        Seguimiento registro = new Seguimiento();

        registro.setClaveIdempotencia(claveIdempotencia);
        registro.setHashSolicitud(hashSolicitud);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Seguimiento",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Seguimiento guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public SeguimientoDto editar(Long id, SeguimientoDto dto) {
        log.info("Editando Seguimiento, id={}", id);
        Seguimiento registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        if (!Objects.equals(registro.getIdParticipacion(), dto.getIdParticipacion())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idParticipacion de un registro existente; anule y cree"
                            + " otro");
        }
        SeguimientoDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Seguimiento",
                id,
                "EDITAR",
                anterior,
                convertirADto(registro),
                "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public SeguimientoDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Seguimiento, id={}", id);
        Seguimiento registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        SeguimientoDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Seguimiento",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public SeguimientoDto consultar(Long id) {
        Seguimiento registro = obtener(id);
        controlAccesoService.validarParticipacion(registro.getIdParticipacion());
        return convertirADto(registro);
    }

    @Override
    public Page<SeguimientoDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Seguimiento> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Seguimiento obtener(Long id) {
        Optional<Seguimiento> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Seguimiento");
        }
        return registro.get();
    }

    private void comprobarVersion(Seguimiento registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(SeguimientoDto dto, Long id) {
        Optional<Participacion> consultarParticipacion =
                participacionRepository.findById(dto.getIdParticipacion());
        if (consultarParticipacion.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Participacion");
        }
        if (!consultarParticipacion.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Participacion esta inactivo");
        }
        controlAccesoService.validarParticipacion(dto.getIdParticipacion());

        if (dto.getFechaProximoSeguimiento() != null
                && dto.getFechaProximoSeguimiento().isBefore(dto.getFechaSeguimiento())) {
            throw ExcepcionNegocio.invalido(
                    "fechaProximoSeguimiento no puede ser anterior a fechaSeguimiento");
        }
    }

    private void copiarCampos(SeguimientoDto dto, Seguimiento registro) {
        registro.setIdParticipacion(dto.getIdParticipacion());
        registro.setFechaSeguimiento(dto.getFechaSeguimiento());
        registro.setFechaProximoSeguimiento(dto.getFechaProximoSeguimiento());
        registro.setEstadoSeguimiento(Normalizador.clave(dto.getEstadoSeguimiento()));
        registro.setAvanceNovedad(Normalizador.texto(dto.getAvanceNovedad()));
        registro.setAccionPendiente(Normalizador.texto(dto.getAccionPendiente()));
        registro.setObservaciones(Normalizador.texto(dto.getObservaciones()));
    }

    public SeguimientoDto convertirADto(Seguimiento registro) {
        SeguimientoDto dto = new SeguimientoDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setIdParticipacion(registro.getIdParticipacion());
        dto.setFechaSeguimiento(registro.getFechaSeguimiento());
        dto.setFechaProximoSeguimiento(registro.getFechaProximoSeguimiento());
        dto.setEstadoSeguimiento(registro.getEstadoSeguimiento());
        dto.setAvanceNovedad(registro.getAvanceNovedad());
        dto.setAccionPendiente(registro.getAccionPendiente());
        dto.setObservaciones(registro.getObservaciones());
        return dto;
    }
}
