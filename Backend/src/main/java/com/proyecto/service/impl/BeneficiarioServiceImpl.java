package com.proyecto.service.impl;

import module java.base;

import com.proyecto.dto.BeneficiarioDTO;
import com.proyecto.exception.ExcepcionDellaVita;
import com.proyecto.model.Beneficiario;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.BeneficiarioService;
import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BeneficiarioServiceImpl implements BeneficiarioService {

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Override
    public BeneficiarioDTO guardar(BeneficiarioDTO dto) {
        System.out.println("INICIO guardarBeneficiario");
        log.info("INICIO guardarBeneficiario");

        if (dto.getCodigoBeneficiario() == null || dto.getCodigoBeneficiario().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_CODIGO_BENEFICIARIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_CODIGO_BENEFICIARIO);
        }

        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_NOMBRE_COMPLETO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_NOMBRE_COMPLETO);
        }

        if (dto.getTipoDocumento() == null || dto.getTipoDocumento().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_TIPO_DOCUMENTO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_TIPO_DOCUMENTO);
        }

        if (dto.getSexo() == null || dto.getSexo().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_SEXO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_SEXO);
        }

        if (dto.getEdad() == null) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_EDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_EDAD);
        }

        if (dto.getMunicipio() == null || dto.getMunicipio().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_MUNICIPIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_MUNICIPIO);
        }

        if (dto.getZona() == null || dto.getZona().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_ZONA);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ZONA);
        }

        if (dto.getNacionalidad() == null || dto.getNacionalidad().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_NACIONALIDAD);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_NACIONALIDAD);
        }

        if (dto.getTipoPoblacion() == null || dto.getTipoPoblacion().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_TIPO_POBLACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_TIPO_POBLACION);
        }

        if (dto.getOrganizacion() == null || dto.getOrganizacion().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_ORGANIZACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ORGANIZACION);
        }

        if (dto.getUsuarioCreacion() == null || dto.getUsuarioCreacion().isBlank()) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.FALTO_USUARIO_CREACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_CREACION);
        }

        Beneficiario codigoExistente = beneficiarioRepository.findByCodigoBeneficiario(dto.getCodigoBeneficiario());
        if (codigoExistente != null) {
            System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.CODIGO_BENEFICIARIO_YA_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0002, HttpStatus.BAD_REQUEST, MensajesCTE.CODIGO_BENEFICIARIO_YA_EXISTE);
        }

        if (dto.getNumeroDocumento() != null && !dto.getNumeroDocumento().isBlank()) {
            Beneficiario documentoExistente = beneficiarioRepository.findByNumeroDocumento(dto.getNumeroDocumento());
            if (documentoExistente != null) {
                System.out.println("ERROR guardarBeneficiario: " + MensajesCTE.DOCUMENTO_YA_EXISTE);
                throw new ExcepcionDellaVita(MensajesCTE.COD0002, HttpStatus.BAD_REQUEST, MensajesCTE.DOCUMENTO_YA_EXISTE);
            }
        }

        Beneficiario beneficiario = new Beneficiario();
        beneficiario.setCodigoBeneficiario(dto.getCodigoBeneficiario());
        beneficiario.setTipoDocumento(dto.getTipoDocumento());
        beneficiario.setNumeroDocumento(dto.getNumeroDocumento());
        beneficiario.setNombreCompleto(dto.getNombreCompleto());
        beneficiario.setSexo(dto.getSexo());
        beneficiario.setEdad(dto.getEdad());
        beneficiario.setMunicipio(dto.getMunicipio());
        beneficiario.setZona(dto.getZona());
        beneficiario.setNacionalidad(dto.getNacionalidad());
        beneficiario.setTipoPoblacion(dto.getTipoPoblacion());
        beneficiario.setOrganizacion(dto.getOrganizacion());
        beneficiario.setFechaRegistro(dto.getFechaRegistro() != null ? dto.getFechaRegistro() : new Date());
        beneficiario.setActivo(MensajesCTE.ACTIVO);
        beneficiario.setDtCreacion(new Date());
        beneficiario.setDtActualizacion(null);
        beneficiario.setUsuarioCreacion(dto.getUsuarioCreacion());
        beneficiario.setUsuarioActualizacion(null);
        beneficiarioRepository.save(beneficiario);

        dto.setIdBeneficiario(beneficiario.getIdBeneficiario());
        dto.setActivo(Boolean.TRUE);
        dto.setMensaje(MensajesCTE.GUARDADO_CORRECTAMENTE);

        System.out.println("OK guardarBeneficiario: idBeneficiario=" + beneficiario.getIdBeneficiario());
        log.info("OK guardarBeneficiario idBeneficiario={}", beneficiario.getIdBeneficiario());
        return dto;
    }

    @Override
    public BeneficiarioDTO editar(BeneficiarioDTO dto) {
        System.out.println("INICIO editarBeneficiario");
        log.info("INICIO editarBeneficiario");

        if (dto.getIdBeneficiario() == null) {
            System.out.println("ERROR editarBeneficiario: " + MensajesCTE.FALTO_ID_BENEFICIARIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_BENEFICIARIO);
        }

        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            System.out.println("ERROR editarBeneficiario: " + MensajesCTE.FALTO_NOMBRE_COMPLETO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_NOMBRE_COMPLETO);
        }

        if (dto.getUsuarioActualizacion() == null || dto.getUsuarioActualizacion().isBlank()) {
            System.out.println("ERROR editarBeneficiario: " + MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_USUARIO_ACTUALIZACION);
        }

        Optional<Beneficiario> consultarBeneficiario = beneficiarioRepository.findById(dto.getIdBeneficiario());
        if (!consultarBeneficiario.isPresent()) {
            System.out.println("ERROR editarBeneficiario: " + MensajesCTE.BENEFICIARIO_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0003, HttpStatus.BAD_REQUEST, MensajesCTE.BENEFICIARIO_NO_EXISTE);
        }

        if (dto.getNumeroDocumento() != null && !dto.getNumeroDocumento().isBlank()) {
            Beneficiario documentoExistente = beneficiarioRepository.findByNumeroDocumento(dto.getNumeroDocumento());
            if (documentoExistente != null && !documentoExistente.getIdBeneficiario().equals(dto.getIdBeneficiario())) {
                System.out.println("ERROR editarBeneficiario: " + MensajesCTE.DOCUMENTO_YA_EXISTE);
                throw new ExcepcionDellaVita(MensajesCTE.COD0002, HttpStatus.BAD_REQUEST, MensajesCTE.DOCUMENTO_YA_EXISTE);
            }
        }

        Beneficiario editarBeneficiario = consultarBeneficiario.get();
        editarBeneficiario.setTipoDocumento(dto.getTipoDocumento());
        editarBeneficiario.setNumeroDocumento(dto.getNumeroDocumento());
        editarBeneficiario.setNombreCompleto(dto.getNombreCompleto());
        editarBeneficiario.setSexo(dto.getSexo());
        editarBeneficiario.setEdad(dto.getEdad());
        editarBeneficiario.setMunicipio(dto.getMunicipio());
        editarBeneficiario.setZona(dto.getZona());
        editarBeneficiario.setNacionalidad(dto.getNacionalidad());
        editarBeneficiario.setTipoPoblacion(dto.getTipoPoblacion());
        editarBeneficiario.setOrganizacion(dto.getOrganizacion());
        if (dto.getFechaRegistro() != null) {
            editarBeneficiario.setFechaRegistro(dto.getFechaRegistro());
        }
        editarBeneficiario.setUsuarioActualizacion(dto.getUsuarioActualizacion());
        editarBeneficiario.setDtActualizacion(new Date());
        beneficiarioRepository.save(editarBeneficiario);

        dto.setCodigoBeneficiario(editarBeneficiario.getCodigoBeneficiario());
        dto.setMensaje(MensajesCTE.EDITADO_CORRECTAMENTE);
        System.out.println("OK editarBeneficiario: idBeneficiario=" + dto.getIdBeneficiario());
        log.info("OK editarBeneficiario idBeneficiario={}", dto.getIdBeneficiario());
        return dto;
    }

    @Override
    public BeneficiarioDTO cambiarEstado(BeneficiarioDTO dto) {
        System.out.println("INICIO cambiarEstadoBeneficiario");
        log.info("INICIO cambiarEstadoBeneficiario");

        if (dto.getIdBeneficiario() == null) {
            System.out.println("ERROR cambiarEstadoBeneficiario: " + MensajesCTE.FALTO_ID_BENEFICIARIO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ID_BENEFICIARIO);
        }

        if (dto.getActivo() == null) {
            System.out.println("ERROR cambiarEstadoBeneficiario: " + MensajesCTE.FALTO_ACTIVO);
            throw new ExcepcionDellaVita(MensajesCTE.COD0001, HttpStatus.BAD_REQUEST, MensajesCTE.FALTO_ACTIVO);
        }

        Optional<Beneficiario> beneficiario = beneficiarioRepository.findById(dto.getIdBeneficiario());
        if (!beneficiario.isPresent()) {
            System.out.println("ERROR cambiarEstadoBeneficiario: " + MensajesCTE.BENEFICIARIO_NO_EXISTE);
            throw new ExcepcionDellaVita(MensajesCTE.COD0003, HttpStatus.BAD_REQUEST, MensajesCTE.BENEFICIARIO_NO_EXISTE);
        }

        Integer nuevoEstado = Boolean.TRUE.equals(dto.getActivo()) ? MensajesCTE.ACTIVO : MensajesCTE.INACTIVO;
        beneficiarioRepository.cambiarEstado(nuevoEstado, dto.getIdBeneficiario());

        dto.setMensaje(MensajesCTE.ESTADO_CAMBIADO_CORRECTAMENTE);
        System.out.println("OK cambiarEstadoBeneficiario: idBeneficiario=" + dto.getIdBeneficiario() + " activo=" + nuevoEstado);
        log.info("OK cambiarEstadoBeneficiario idBeneficiario={} activo={}", dto.getIdBeneficiario(), nuevoEstado);
        return dto;
    }

    @Override
    public List<BeneficiarioDTO> listar(BeneficiarioDTO request) {
        System.out.println("INICIO listarBeneficiarios");
        log.info("INICIO listarBeneficiarios");

        List<Beneficiario> beneficiariosList;

        if (request != null && request.getMunicipio() != null && !request.getMunicipio().isBlank()) {
            beneficiariosList = beneficiarioRepository.listarPorMunicipio(request.getMunicipio());
        } else if (request != null && request.getOrganizacion() != null && !request.getOrganizacion().isBlank()) {
            beneficiariosList = beneficiarioRepository.listarPorOrganizacion(request.getOrganizacion());
        } else if (request != null && request.getTipoPoblacion() != null && !request.getTipoPoblacion().isBlank()) {
            beneficiariosList = beneficiarioRepository.listarPorTipoPoblacion(request.getTipoPoblacion());
        } else if (request != null && request.getActivo() != null) {
            Integer estado = Boolean.TRUE.equals(request.getActivo()) ? MensajesCTE.ACTIVO : MensajesCTE.INACTIVO;
            beneficiariosList = beneficiarioRepository.listarActivo(estado);
        } else {
            beneficiariosList = beneficiarioRepository.findAll();
        }

        List<BeneficiarioDTO> listaBeneficiarios = beneficiariosList.stream()
                .map(beneficiario -> BeneficiarioDTO.builder()
                        .idBeneficiario(beneficiario.getIdBeneficiario())
                        .codigoBeneficiario(beneficiario.getCodigoBeneficiario())
                        .tipoDocumento(beneficiario.getTipoDocumento())
                        .numeroDocumento(beneficiario.getNumeroDocumento())
                        .nombreCompleto(beneficiario.getNombreCompleto())
                        .sexo(beneficiario.getSexo())
                        .edad(beneficiario.getEdad())
                        .municipio(beneficiario.getMunicipio())
                        .zona(beneficiario.getZona())
                        .nacionalidad(beneficiario.getNacionalidad())
                        .tipoPoblacion(beneficiario.getTipoPoblacion())
                        .organizacion(beneficiario.getOrganizacion())
                        .fechaRegistro(beneficiario.getFechaRegistro())
                        .dtCreacion(beneficiario.getDtCreacion())
                        .dtActualizacion(beneficiario.getDtActualizacion())
                        .usuarioCreacion(beneficiario.getUsuarioCreacion())
                        .usuarioActualizacion(beneficiario.getUsuarioActualizacion())
                        .activo(beneficiario.getActivo() != null && beneficiario.getActivo().equals(MensajesCTE.ACTIVO) ? Boolean.TRUE : Boolean.FALSE)
                        .mensaje(MensajesCTE.LISTADO_CORRECTAMENTE)
                        .build())
                .collect(Collectors.toList());

        System.out.println("OK listarBeneficiarios: cantidad=" + listaBeneficiarios.size());
        log.info("OK listarBeneficiarios cantidad={}", listaBeneficiarios.size());
        return listaBeneficiarios;
    }
}
