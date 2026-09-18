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
public class BeneficiarioServiceImpl implements BeneficiarioService {
    private final BeneficiarioRepository repository;
    private final AuditoriaService auditoriaService;
    private final ControlAccesoService controlAccesoService;

    @Override
    @Transactional
    public BeneficiarioDto guardar(BeneficiarioDto dto) {
        log.info("Iniciando registro de Beneficiario");

        validar(dto, null);
        controlAccesoService.validarMunicipio(dto.getMunicipio());
        Beneficiario registro = new Beneficiario();
        registro.setCodigoInterno("BEN-" + UUID.randomUUID());

        copiarCampos(dto, registro);
        registro.setEstadoConsentimiento("PENDIENTE");
        registro.setEstadoRevisionDuplicidad(determinarEstadoDuplicidad(dto));
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Beneficiario guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public BeneficiarioDto editar(Long id, BeneficiarioDto dto) {
        log.info("Editando Beneficiario, id={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());
        if (registro.getIdBeneficiarioPrincipal() != null) {
            throw ExcepcionNegocio.conflicto(
                    "Este registro fue unificado; utilice su beneficiario principal");
        }
        BeneficiarioDto anterior = convertirADto(registro);
        validar(dto, id);
        controlAccesoService.validarMunicipio(dto.getMunicipio());
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                id,
                "EDITAR",
                anterior,
                convertirADto(registro),
                "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public BeneficiarioDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Beneficiario, id={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());
        if (registro.getIdBeneficiarioPrincipal() != null) {
            throw ExcepcionNegocio.conflicto(
                    "Este registro fue unificado; utilice su beneficiario principal");
        }
        BeneficiarioDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public BeneficiarioDto consultar(Long id) {
        controlAccesoService.validarBeneficiario(id);
        return convertirADto(obtener(id));
    }

    @Override
    public Page<BeneficiarioDto> listar(
            String nombre, String documento, Boolean activo, int pagina, int tamanio) {
        String numeroDocumento = Normalizador.documento(documento);
        Page<Beneficiario> registros;
        if (controlAccesoService.esOperador()) {
            registros =
                    repository.buscarBeneficiariosPorMunicipio(
                            controlAccesoService.municipioAsignado(),
                            Normalizador.clave(nombre),
                            Objects.toString(numeroDocumento, ""),
                            activo,
                            Paginacion.crear(pagina, tamanio));
        } else {
            registros =
                    repository.buscarBeneficiarios(
                            Normalizador.clave(nombre),
                            Objects.toString(numeroDocumento, ""),
                            activo,
                            Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }


    @Override
    @Transactional
    public BeneficiarioDto cambiarConsentimiento(Long id, ConsentimientoDto dto) {
        log.info("Actualizando consentimiento informado, beneficiarioId={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());

        BeneficiarioDto anterior = convertirADto(registro);
        registro.setEstadoConsentimiento(dto.getEstado());
        repository.saveAndFlush(registro);

        auditoriaService.registrar(
                "Beneficiario",
                id,
                "CONSENTIMIENTO",
                anterior,
                convertirADto(registro),
                Objects.toString(dto.getMotivo(), "Cambio de consentimiento informado"));
        return convertirADto(registro);
    }

    private String determinarEstadoDuplicidad(BeneficiarioDto dto) {
        if (!controlAccesoService.esOperador()) {
            return "APROBADO";
        }
        if (dto.getNumeroDocumento() != null || dto.getFechaNacimiento() == null) {
            return "APROBADO";
        }

        String nombreCompleto =
                String.join(
                        " ",
                        dto.getPrimerNombre(),
                        Objects.toString(dto.getSegundoNombre(), ""),
                        dto.getPrimerApellido(),
                        Objects.toString(dto.getSegundoApellido(), ""));
        String nombreNormalizado = Normalizador.clave(nombreCompleto);

        boolean coincidencia =
                repository.findByNombreNormalizadoAndFechaNacimientoOrderById(
                                nombreNormalizado, dto.getFechaNacimiento())
                        .stream()
                        .anyMatch(b -> b.getIdBeneficiarioPrincipal() == null);

        if (coincidencia) {
            log.warn(
                    "Posible duplicado sin documento detectado; registro quedara EN_REVISION_DUPLICIDAD");
            return "EN_REVISION_DUPLICIDAD";
        }
        return "APROBADO";
    }

    private Beneficiario obtener(Long id) {
        Optional<Beneficiario> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario");
        }
        return registro.get();
    }

    private void comprobarVersion(Beneficiario registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(BeneficiarioDto dto, Long id) {

        String tipoDocumento = Normalizador.texto(dto.getTipoDocumento());
        String numeroDocumento = Normalizador.documento(dto.getNumeroDocumento());
        if ((tipoDocumento == null) != (numeroDocumento == null)) {
            throw ExcepcionNegocio.invalido(
                    "Debe informar tipoDocumento y numeroDocumento juntos, o dejar ambos vacios");
        }
        if (numeroDocumento != null) {
            tipoDocumento = Normalizador.clave(tipoDocumento);
            if (!Normalizador.documentoValido(numeroDocumento)) {
                throw ExcepcionNegocio.invalido(
                        "numeroDocumento invalido; si no lo conoce, deje el campo vacio");
            }
            Optional<Beneficiario> existente =
                    repository.findByTipoDocumentoAndNumeroDocumento(
                            tipoDocumento, numeroDocumento);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw ExcepcionNegocio.conflicto("Ya existe un beneficiario con ese documento");
            }
        }
        dto.setTipoDocumento(tipoDocumento);
        dto.setNumeroDocumento(numeroDocumento);
    }

    private void copiarCampos(BeneficiarioDto dto, Beneficiario registro) {
        registro.setPrimerNombre(Normalizador.texto(dto.getPrimerNombre()));
        registro.setSegundoNombre(Normalizador.texto(dto.getSegundoNombre()));
        registro.setPrimerApellido(Normalizador.texto(dto.getPrimerApellido()));
        registro.setSegundoApellido(Normalizador.texto(dto.getSegundoApellido()));
        registro.setTipoDocumento(Normalizador.texto(dto.getTipoDocumento()));
        registro.setNumeroDocumento(Normalizador.texto(dto.getNumeroDocumento()));
        registro.setFechaNacimiento(dto.getFechaNacimiento());
        registro.setCelular(Normalizador.texto(dto.getCelular()));
        registro.setMunicipio(Normalizador.texto(dto.getMunicipio()));
        registro.setDireccion(Normalizador.texto(dto.getDireccion()));
        String nombreCompleto =
                String.join(
                        " ",
                        dto.getPrimerNombre(),
                        Objects.toString(dto.getSegundoNombre(), ""),
                        dto.getPrimerApellido(),
                        Objects.toString(dto.getSegundoApellido(), ""));
        registro.setNombreNormalizado(Normalizador.clave(nombreCompleto));
    }

    public BeneficiarioDto convertirADto(Beneficiario registro) {
        BeneficiarioDto dto = new BeneficiarioDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setPrimerNombre(registro.getPrimerNombre());
        dto.setSegundoNombre(registro.getSegundoNombre());
        dto.setPrimerApellido(registro.getPrimerApellido());
        dto.setSegundoApellido(registro.getSegundoApellido());
        dto.setTipoDocumento(registro.getTipoDocumento());
        dto.setNumeroDocumento(registro.getNumeroDocumento());
        dto.setFechaNacimiento(registro.getFechaNacimiento());
        dto.setCelular(registro.getCelular());
        dto.setMunicipio(registro.getMunicipio());
        dto.setDireccion(registro.getDireccion());
        dto.setCodigoInterno(registro.getCodigoInterno());
        dto.setIdBeneficiarioPrincipal(registro.getIdBeneficiarioPrincipal());
        dto.setEstadoRevisionDuplicidad(registro.getEstadoRevisionDuplicidad());
        dto.setEstadoConsentimiento(registro.getEstadoConsentimiento());
        return dto;
    }
}
