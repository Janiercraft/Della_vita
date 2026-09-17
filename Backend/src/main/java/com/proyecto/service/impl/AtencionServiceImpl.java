package com.proyecto.service.impl;

import module java.base;

import com.proyecto.dto.AtencionDTO;
import com.proyecto.exception.ExcepcionDellaVita;
import com.proyecto.model.Actividad;
import com.proyecto.model.Atencion;
import com.proyecto.model.Beneficiario;
import com.proyecto.repository.ActividadRepository;
import com.proyecto.repository.AtencionRepository;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.AtencionService;
import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AtencionServiceImpl implements AtencionService {

    @Autowired
    private AtencionRepository atencionRepository;

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Autowired
    private ActividadRepository actividadRepository;

    @Override
    public AtencionDTO guardar(AtencionDTO dto) {
        System.out.println("INICIO guardarAtencion");
        log.info("INICIO guardarAtencion");

        if (dto.getIdBeneficiario() == null) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.FALTO_ID_BENEFICIARIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_BENEFICIARIO);
        }

        if (dto.getIdActividad() == null) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.FALTO_ID_ACTIVIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_ACTIVIDAD);
        }

        if (dto.getTipoAtencionAyuda() == null || dto.getTipoAtencionAyuda().isBlank()) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.FALTO_TIPO_ATENCION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_TIPO_ATENCION);
        }

        if (dto.getUsuarioCreacion() == null || dto.getUsuarioCreacion().isBlank()) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.FALTO_USUARIO_CREACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_CREACION);
        }

        Optional<Beneficiario> consultarBeneficiario = beneficiarioRepository.findById(dto.getIdBeneficiario());
        if (!consultarBeneficiario.isPresent()) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.BENEFICIARIO_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0003, HttpStatus.BAD_REQUEST, MensajesCTE.BENEFICIARIO_NO_EXISTE);
        }

        Beneficiario beneficiario = consultarBeneficiario.get();
        if (!MensajesCTE.ACTIVO.equals(beneficiario.getActivo())) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.BENEFICIARIO_INACTIVO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0007, HttpStatus.BAD_REQUEST, MensajesCTE.BENEFICIARIO_INACTIVO);
        }

        Optional<Actividad> consultarActividad = actividadRepository.findById(dto.getIdActividad());
        if (!consultarActividad.isPresent()) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.ACTIVIDAD_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0006, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_NO_EXISTE);
        }

        Actividad actividad = consultarActividad.get();
        if (!MensajesCTE.ACTIVO.equals(actividad.getActivo())) {
            System.out.println("ERROR guardarAtencion: " + MensajesCTE.ACTIVIDAD_INACTIVA);
            throw new ExcepcionDellaVita(MensajesCTE.COD0008, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_INACTIVA);
        }

        String estado = dto.getEstado();
        if (estado == null || estado.isBlank()) {
            estado = MensajesCTE.ESTADO_PENDIENTE;
        }
        validarEstado(estado);

        Atencion atencion = new Atencion();
        atencion.setBeneficiario(beneficiario);
        atencion.setActividad(actividad);
        atencion.setFechaAtencion(dto.getFechaAtencion() != null ? dto.getFechaAtencion() : new Date());
        atencion.setTipoAtencionAyuda(dto.getTipoAtencionAyuda());
        atencion.setEstado(estado);
        atencion.setObservaciones(dto.getObservaciones());
        atencion.setDtCreacion(new Date());
        atencion.setDtActualizacion(null);
        atencion.setUsuarioCreacion(dto.getUsuarioCreacion());
        atencion.setUsuarioActualizacion(null);
        atencionRepository.save(atencion);

        dto.setIdAtencion(atencion.getIdAtencion());
        dto.setCodigoBeneficiario(beneficiario.getCodigoBeneficiario());
        dto.setNombreCompleto(beneficiario.getNombreCompleto());
        dto.setMunicipio(beneficiario.getMunicipio());
        dto.setOrganizacion(beneficiario.getOrganizacion());
        dto.setNombreActividad(actividad.getNombreActividad());
        dto.setResultadoAsociado(actividad.getResultadoAsociado());
        dto.setEstado(estado);
        dto.setMensaje(MensajesCTE.GUARDADO_CORRECTAMENTE);

        System.out.println("OK guardarAtencion: idAtencion=" + atencion.getIdAtencion());
        log.info("OK guardarAtencion idAtencion={}", atencion.getIdAtencion());
        return dto;
    }

    @Override
    public AtencionDTO editar(AtencionDTO dto) {
        System.out.println("INICIO editarAtencion");
        log.info("INICIO editarAtencion");

        if (dto.getIdAtencion() == null) {
            System.out.println("ERROR editarAtencion: " + MensajesCTE.FALTO_ID_ATENCION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_ATENCION);
        }

        if (dto.getUsuarioActualizacion() == null || dto.getUsuarioActualizacion().isBlank()) {
            System.out.println("ERROR editarAtencion: " + MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
        }

        Optional<Atencion> consultarAtencion = atencionRepository.findById(dto.getIdAtencion());
        if (!consultarAtencion.isPresent()) {
            System.out.println("ERROR editarAtencion: " + MensajesCTE.ATENCION_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0009, HttpStatus.BAD_REQUEST, MensajesCTE.ATENCION_NO_EXISTE);
        }

        Atencion editarAtencion = consultarAtencion.get();

        if (dto.getIdActividad() != null) {
            Optional<Actividad> consultarActividad = actividadRepository.findById(dto.getIdActividad());
            if (!consultarActividad.isPresent()) {
                System.out.println("ERROR editarAtencion: " + MensajesCTE.ACTIVIDAD_NO_EXISTE);
                throw new ExcepcionDellaVita(MensajesCTE.COD0006, HttpStatus.BAD_REQUEST, MensajesCTE.ACTIVIDAD_NO_EXISTE);
            }
            editarAtencion.setActividad(consultarActividad.get());
        }

        if (dto.getTipoAtencionAyuda() != null && !dto.getTipoAtencionAyuda().isBlank()) {
            editarAtencion.setTipoAtencionAyuda(dto.getTipoAtencionAyuda());
        }

        if (dto.getFechaAtencion() != null) {
            editarAtencion.setFechaAtencion(dto.getFechaAtencion());
        }

        if (dto.getObservaciones() != null) {
            editarAtencion.setObservaciones(dto.getObservaciones());
        }

        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            validarEstado(dto.getEstado());
            editarAtencion.setEstado(dto.getEstado());
        }

        editarAtencion.setUsuarioActualizacion(dto.getUsuarioActualizacion());
        editarAtencion.setDtActualizacion(new Date());
        atencionRepository.save(editarAtencion);

        dto.setMensaje(MensajesCTE.EDITADO_CORRECTAMENTE);
        System.out.println("OK editarAtencion: idAtencion=" + dto.getIdAtencion());
        log.info("OK editarAtencion idAtencion={}", dto.getIdAtencion());
        return dto;
    }

    @Override
    public AtencionDTO cambiarEstado(AtencionDTO dto) {
        System.out.println("INICIO cambiarEstadoAtencion");
        log.info("INICIO cambiarEstadoAtencion");

        if (dto.getIdAtencion() == null) {
            System.out.println("ERROR cambiarEstadoAtencion: " + MensajesCTE.FALTO_ID_ATENCION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_ATENCION);
        }

        if (dto.getEstado() == null || dto.getEstado().isBlank()) {
            System.out.println("ERROR cambiarEstadoAtencion: " + MensajesCTE.FALTO_ESTADO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ESTADO);
        }

        if (dto.getUsuarioActualizacion() == null || dto.getUsuarioActualizacion().isBlank()) {
            System.out.println("ERROR cambiarEstadoAtencion: " + MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
        }

        validarEstado(dto.getEstado());

        Optional<Atencion> consultarAtencion = atencionRepository.findById(dto.getIdAtencion());
        if (!consultarAtencion.isPresent()) {
            System.out.println("ERROR cambiarEstadoAtencion: " + MensajesCTE.ATENCION_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0009, HttpStatus.BAD_REQUEST, MensajesCTE.ATENCION_NO_EXISTE);
        }

        atencionRepository.cambiarEstado(dto.getEstado(), dto.getUsuarioActualizacion(), new Date(), dto.getIdAtencion());

        dto.setMensaje(MensajesCTE.ESTADO_CAMBIADO_CORRECTAMENTE);
        System.out.println("OK cambiarEstadoAtencion: idAtencion=" + dto.getIdAtencion() + " estado=" + dto.getEstado());
        log.info("OK cambiarEstadoAtencion idAtencion={} estado={}", dto.getIdAtencion(), dto.getEstado());
        return dto;
    }

    @Override
    public List<AtencionDTO> listar(AtencionDTO request) {
        System.out.println("INICIO listarAtenciones");
        log.info("INICIO listarAtenciones");

        List<Atencion> atencionesList;
        if (request != null && request.getEstado() != null && !request.getEstado().isBlank()) {
            atencionesList = atencionRepository.listarPorEstado(request.getEstado());
        } else if (request != null && request.getMunicipio() != null && !request.getMunicipio().isBlank()) {
            atencionesList = atencionRepository.listarPorMunicipio(request.getMunicipio());
        } else if (request != null && request.getOrganizacion() != null && !request.getOrganizacion().isBlank()) {
            atencionesList = atencionRepository.listarPorOrganizacion(request.getOrganizacion());
        } else if (request != null && request.getResultadoAsociado() != null && !request.getResultadoAsociado().isBlank()) {
            atencionesList = atencionRepository.listarPorResultado(request.getResultadoAsociado());
        } else {
            atencionesList = atencionRepository.findAll();
        }

        List<AtencionDTO> listaAtenciones = convertirLista(atencionesList);
        System.out.println("OK listarAtenciones: cantidad=" + listaAtenciones.size());
        log.info("OK listarAtenciones cantidad={}", listaAtenciones.size());
        return listaAtenciones;
    }

    @Override
    public List<AtencionDTO> listarPorBeneficiario(AtencionDTO request) {
        System.out.println("INICIO listarAtencionesPorBeneficiario");
        log.info("INICIO listarAtencionesPorBeneficiario");

        if (request == null || request.getIdBeneficiario() == null) {
            System.out.println("ERROR listarAtencionesPorBeneficiario: " + MensajesCTE.FALTO_ID_BENEFICIARIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_BENEFICIARIO);
        }

        Optional<Beneficiario> consultarBeneficiario = beneficiarioRepository.findById(request.getIdBeneficiario());
        if (!consultarBeneficiario.isPresent()) {
            System.out.println("ERROR listarAtencionesPorBeneficiario: " + MensajesCTE.BENEFICIARIO_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0003, HttpStatus.BAD_REQUEST, MensajesCTE.BENEFICIARIO_NO_EXISTE);
        }

        List<Atencion> atencionesList = atencionRepository.listarPorBeneficiario(request.getIdBeneficiario());
        List<AtencionDTO> listaAtenciones = convertirLista(atencionesList);

        System.out.println("OK listarAtencionesPorBeneficiario: cantidad=" + listaAtenciones.size());
        log.info("OK listarAtencionesPorBeneficiario cantidad={}", listaAtenciones.size());
        return listaAtenciones;
    }

    private void validarEstado(String estado) {
        if (!MensajesCTE.ESTADO_PENDIENTE.equals(estado)
                && !MensajesCTE.ESTADO_ATENDIDO.equals(estado)
                && !MensajesCTE.ESTADO_EN_SEGUIMIENTO.equals(estado)
                && !MensajesCTE.ESTADO_FINALIZADO.equals(estado)) {
            System.out.println("ERROR validarEstado: " + MensajesCTE.ESTADO_INVALIDO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0010, HttpStatus.BAD_REQUEST, MensajesCTE.ESTADO_INVALIDO);
        }
    }

    private List<AtencionDTO> convertirLista(List<Atencion> atencionesList) {
        return atencionesList.stream()
                .map(atencion -> AtencionDTO.builder()
                        .idAtencion(atencion.getIdAtencion())
                        .idBeneficiario(atencion.getBeneficiario().getIdBeneficiario())
                        .codigoBeneficiario(atencion.getBeneficiario().getCodigoBeneficiario())
                        .nombreCompleto(atencion.getBeneficiario().getNombreCompleto())
                        .municipio(atencion.getBeneficiario().getMunicipio())
                        .organizacion(atencion.getBeneficiario().getOrganizacion())
                        .idActividad(atencion.getActividad().getIdActividad())
                        .nombreActividad(atencion.getActividad().getNombreActividad())
                        .resultadoAsociado(atencion.getActividad().getResultadoAsociado())
                        .fechaAtencion(atencion.getFechaAtencion())
                        .tipoAtencionAyuda(atencion.getTipoAtencionAyuda())
                        .estado(atencion.getEstado())
                        .observaciones(atencion.getObservaciones())
                        .dtCreacion(atencion.getDtCreacion())
                        .dtActualizacion(atencion.getDtActualizacion())
                        .usuarioCreacion(atencion.getUsuarioCreacion())
                        .usuarioActualizacion(atencion.getUsuarioActualizacion())
                        .mensaje(MensajesCTE.LISTADO_CORRECTAMENTE)
                        .build())
                .collect(Collectors.toList());
    }
}
