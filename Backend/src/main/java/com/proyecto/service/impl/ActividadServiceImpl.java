package com.proyecto.service.impl;

import module java.base;

import com.proyecto.dto.ActividadDTO;
import com.proyecto.exception.ExcepcionDellaVita;
import com.proyecto.model.Actividad;
import com.proyecto.repository.ActividadRepository;
import com.proyecto.service.ActividadService;
import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ActividadServiceImpl implements ActividadService {

    @Autowired
    private ActividadRepository actividadRepository;

    @Override
    public ActividadDTO guardar(ActividadDTO dto) {
        System.out.println("INICIO guardarActividad");
        log.info("INICIO guardarActividad");

        if (dto.getNombreActividad() == null || dto.getNombreActividad().isBlank()) {
            System.out.println("ERROR guardarActividad: " + MensajesCTE.FALTO_NOMBRE_ACTIVIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_NOMBRE_ACTIVIDAD);
        }

        if (dto.getResultadoAsociado() == null || dto.getResultadoAsociado().isBlank()) {
            System.out.println("ERROR guardarActividad: " + MensajesCTE.FALTO_RESULTADO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_RESULTADO);
        }

        if (!dto.getResultadoAsociado().equals("R1")
                && !dto.getResultadoAsociado().equals("R2")
                && !dto.getResultadoAsociado().equals("R3")) {
            System.out.println("ERROR guardarActividad: " + MensajesCTE.RESULTADO_INVALIDO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0004, HttpStatus.BAD_REQUEST, MensajesCTE.RESULTADO_INVALIDO);
        }

        if (dto.getUsuarioCreacion() == null || dto.getUsuarioCreacion().isBlank()) {
            System.out.println("ERROR guardarActividad: " + MensajesCTE.FALTO_USUARIO_CREACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_CREACION);
        }

        Actividad actividadExistente = actividadRepository.findByNombreActividad(dto.getNombreActividad());
        if (actividadExistente != null) {
            System.out.println("ERROR guardarActividad: " + MensajesCTE.ACTIVIDAD_YA_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0005, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_YA_EXISTE);
        }

        Actividad actividad = new Actividad();
        actividad.setNombreActividad(dto.getNombreActividad());
        actividad.setResultadoAsociado(dto.getResultadoAsociado());
        actividad.setDescripcionResultado(dto.getDescripcionResultado());
        actividad.setActivo(MensajesCTE.ACTIVO);
        actividad.setDtCreacion(new Date());
        actividad.setDtActualizacion(null);
        actividad.setUsuarioCreacion(dto.getUsuarioCreacion());
        actividad.setUsuarioActualizacion(null);
        actividadRepository.save(actividad);

        dto.setIdActividad(actividad.getIdActividad());
        dto.setActivo(Boolean.TRUE);
        dto.setMensaje(MensajesCTE.GUARDADO_CORRECTAMENTE);

        System.out.println("OK guardarActividad: idActividad=" + actividad.getIdActividad());
        log.info("OK guardarActividad idActividad={}", actividad.getIdActividad());
        return dto;
    }

    @Override
    public ActividadDTO editar(ActividadDTO dto) {
        System.out.println("INICIO editarActividad");
        log.info("INICIO editarActividad");

        if (dto.getIdActividad() == null) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.FALTO_ID_ACTIVIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_ACTIVIDAD);
        }

        if (dto.getNombreActividad() == null || dto.getNombreActividad().isBlank()) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.FALTO_NOMBRE_ACTIVIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_NOMBRE_ACTIVIDAD);
        }

        if (dto.getResultadoAsociado() == null || dto.getResultadoAsociado().isBlank()) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.FALTO_RESULTADO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_RESULTADO);
        }

        if (dto.getUsuarioActualizacion() == null || dto.getUsuarioActualizacion().isBlank()) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
        }

        Optional<Actividad> consultarActividad = actividadRepository.findById(dto.getIdActividad());
        if (!consultarActividad.isPresent()) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.ACTIVIDAD_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0006, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_NO_EXISTE);
        }

        Actividad actividadExistente = actividadRepository.findByNombreActividad(dto.getNombreActividad());
        if (actividadExistente != null && !actividadExistente.getIdActividad().equals(dto.getIdActividad())) {
            System.out.println("ERROR editarActividad: " + MensajesCTE.ACTIVIDAD_YA_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0005, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_YA_EXISTE);
        }

        Actividad editarActividad = consultarActividad.get();
        editarActividad.setNombreActividad(dto.getNombreActividad());
        editarActividad.setResultadoAsociado(dto.getResultadoAsociado());
        editarActividad.setDescripcionResultado(dto.getDescripcionResultado());
        editarActividad.setUsuarioActualizacion(dto.getUsuarioActualizacion());
        editarActividad.setDtActualizacion(new Date());
        actividadRepository.save(editarActividad);

        dto.setMensaje(MensajesCTE.EDITADO_CORRECTAMENTE);
        System.out.println("OK editarActividad: idActividad=" + dto.getIdActividad());
        log.info("OK editarActividad idActividad={}", dto.getIdActividad());
        return dto;
    }

    @Override
    public ActividadDTO cambiarEstado(ActividadDTO dto) {
        System.out.println("INICIO cambiarEstadoActividad");
        log.info("INICIO cambiarEstadoActividad");

        if (dto.getIdActividad() == null) {
            System.out.println("ERROR cambiarEstadoActividad: " + MensajesCTE.FALTO_ID_ACTIVIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_ACTIVIDAD);
        }

        if (dto.getActivo() == null) {
            System.out.println("ERROR cambiarEstadoActividad: " + MensajesCTE.FALTO_ACTIVO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ACTIVO);
        }

        Optional<Actividad> actividad = actividadRepository.findById(dto.getIdActividad());
        if (!actividad.isPresent()) {
            System.out.println("ERROR cambiarEstadoActividad: " + MensajesCTE.ACTIVIDAD_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0006, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_NO_EXISTE);
        }

        Integer nuevoEstado = Boolean.TRUE.equals(dto.getActivo()) ? MensajesCTE.ACTIVO : MensajesCTE.INACTIVO;
        actividadRepository.cambiarEstado(nuevoEstado, dto.getIdActividad());

        dto.setMensaje(MensajesCTE.ESTADO_CAMBIADO_CORRECTAMENTE);
        System.out.println("OK cambiarEstadoActividad: idActividad=" + dto.getIdActividad() + " activo=" + nuevoEstado);
        log.info("OK cambiarEstadoActividad idActividad={} activo={}", dto.getIdActividad(), nuevoEstado);
        return dto;
    }

    @Override
    public List<ActividadDTO> listar(ActividadDTO request) {
        System.out.println("INICIO listarActividades");
        log.info("INICIO listarActividades");

        List<Actividad> actividadesList;
        if (request != null && request.getResultadoAsociado() != null && !request.getResultadoAsociado().isBlank()) {
            actividadesList = actividadRepository.listarPorResultado(request.getResultadoAsociado());
        } else if (request != null && request.getActivo() != null) {
            Integer estado = Boolean.TRUE.equals(request.getActivo()) ? MensajesCTE.ACTIVO : MensajesCTE.INACTIVO;
            actividadesList = actividadRepository.listarActivo(estado);
        } else {
            actividadesList = actividadRepository.findAll();
        }

        List<ActividadDTO> listaActividades = actividadesList.stream()
                .map(actividad -> ActividadDTO.builder()
                        .idActividad(actividad.getIdActividad())
                        .nombreActividad(actividad.getNombreActividad())
                        .resultadoAsociado(actividad.getResultadoAsociado())
                        .descripcionResultado(actividad.getDescripcionResultado())
                        .dtCreacion(actividad.getDtCreacion())
                        .dtActualizacion(actividad.getDtActualizacion())
                        .usuarioCreacion(actividad.getUsuarioCreacion())
                        .usuarioActualizacion(actividad.getUsuarioActualizacion())
                        .activo(actividad.getActivo() != null && actividad.getActivo().equals(MensajesCTE.ACTIVO) ? Boolean.TRUE : Boolean.FALSE)
                        .mensaje(MensajesCTE.LISTADO_CORRECTAMENTE)
                        .build())
                .collect(Collectors.toList());

        System.out.println("OK listarActividades: cantidad=" + listaActividades.size());
        log.info("OK listarActividades cantidad={}", listaActividades.size());
        return listaActividades;
    }
}
