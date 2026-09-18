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
public class AtencionServiceImpl implements AtencionService {
    private final AtencionRepository repository;
    private final AuditoriaService auditoriaService;
    private final ParticipacionRepository participacionRepository;
    private final HuellaService huellaService;
    private final ControlAccesoService controlAccesoService;

    @Override
    @Transactional
    public AtencionDto guardar(AtencionDto dto, String claveIdempotencia) {
        log.info("Iniciando registro de Atencion");

        if (claveIdempotencia == null || !claveIdempotencia.matches("[A-Za-z0-9_-]{8,100}")) {
            throw ExcepcionNegocio.invalido(
                    "Idempotency-Key debe tener de 8 a 100 letras, numeros, guiones o guiones"
                            + " bajos");
        }
        String hashSolicitud = huellaService.calcular(dto);
        Optional<Atencion> solicitudAnterior =
                repository.findByClaveIdempotencia(claveIdempotencia);
        if (solicitudAnterior.isPresent()) {
            if (!solicitudAnterior.get().getHashSolicitud().equals(hashSolicitud)) {
                throw ExcepcionNegocio.conflicto(
                        "La clave de idempotencia ya se utilizo con otros datos");
            }
            return convertirADto(solicitudAnterior.get());
        }
        validar(dto, null);
        Atencion registro = new Atencion();

        registro.setClaveIdempotencia(claveIdempotencia);
        registro.setHashSolicitud(hashSolicitud);
        copiarCampos(dto, registro);
        registro.setEstadoValidacionAyuda(determinarEstadoValidacion(dto.getTipoAtencion()));
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Atencion",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Atencion guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public AtencionDto editar(Long id, AtencionDto dto) {
        log.info("Editando Atencion, id={}", id);
        Atencion registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        if (!Objects.equals(registro.getIdParticipacion(), dto.getIdParticipacion())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idParticipacion de un registro existente; anule y cree"
                            + " otro");
        }
        AtencionDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        registro.setEstadoValidacionAyuda(determinarEstadoValidacion(dto.getTipoAtencion()));
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Atencion", id, "EDITAR", anterior, convertirADto(registro), "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public AtencionDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Atencion, id={}", id);
        Atencion registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        AtencionDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Atencion",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }


    @Override
    @Transactional
    public AtencionDto validarAyuda(Long id, ValidacionAyudaDto dto) {
        log.info("Validando ayuda, atencionId={}", id);
        Atencion registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        if ("NO_APLICA".equals(registro.getEstadoValidacionAyuda())) {
            throw ExcepcionNegocio.conflicto(
                    "La atencion no fue registrada como ayuda y no requiere validacion");
        }
        AtencionDto anterior = convertirADto(registro);
        registro.setEstadoValidacionAyuda(dto.getEstado());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Atencion",
                id,
                "VALIDAR_AYUDA",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public AtencionDto consultar(Long id) {
        Atencion registro = obtener(id);
        controlAccesoService.validarParticipacion(registro.getIdParticipacion());
        return convertirADto(registro);
    }

    @Override
    public Page<AtencionDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Atencion> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Atencion obtener(Long id) {
        Optional<Atencion> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Atencion");
        }
        return registro.get();
    }

    private void comprobarVersion(Atencion registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(AtencionDto dto, Long id) {
        Optional<Participacion> consultarParticipacion =
                participacionRepository.findById(dto.getIdParticipacion());
        if (consultarParticipacion.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Participacion");
        }
        if (!consultarParticipacion.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Participacion esta inactivo");
        }
        controlAccesoService.validarParticipacion(dto.getIdParticipacion());
    }


    private String determinarEstadoValidacion(String tipoAtencion) {
        String tipo = Normalizador.clave(tipoAtencion);
        if (tipo.contains("AYUDA") || tipo.contains("KIT") || tipo.contains("ENTREGA")) {
            return "PENDIENTE";
        }
        return "NO_APLICA";
    }

    private void copiarCampos(AtencionDto dto, Atencion registro) {
        registro.setIdParticipacion(dto.getIdParticipacion());
        registro.setFechaAtencion(dto.getFechaAtencion());
        registro.setTipoAtencion(Normalizador.texto(dto.getTipoAtencion()));
        registro.setDescripcion(Normalizador.texto(dto.getDescripcion()));
        registro.setResponsable(Normalizador.texto(dto.getResponsable()));
        registro.setResultado(Normalizador.texto(dto.getResultado()));
        registro.setRemision(Normalizador.texto(dto.getRemision()));
        registro.setObservaciones(Normalizador.texto(dto.getObservaciones()));
        registro.setEstadoAtencion(Normalizador.texto(dto.getEstadoAtencion()));
    }

    public AtencionDto convertirADto(Atencion registro) {
        AtencionDto dto = new AtencionDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setIdParticipacion(registro.getIdParticipacion());
        dto.setFechaAtencion(registro.getFechaAtencion());
        dto.setTipoAtencion(registro.getTipoAtencion());
        dto.setDescripcion(registro.getDescripcion());
        dto.setResponsable(registro.getResponsable());
        dto.setResultado(registro.getResultado());
        dto.setRemision(registro.getRemision());
        dto.setObservaciones(registro.getObservaciones());
        dto.setEstadoAtencion(registro.getEstadoAtencion());
        dto.setEstadoValidacionAyuda(registro.getEstadoValidacionAyuda());
        return dto;
    }
}
