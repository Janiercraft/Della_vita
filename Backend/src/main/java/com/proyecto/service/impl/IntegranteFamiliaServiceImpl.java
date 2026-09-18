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
public class IntegranteFamiliaServiceImpl implements IntegranteFamiliaService {
    private final IntegranteFamiliaRepository repository;
    private final AuditoriaService auditoriaService;
    private final FamiliaRepository familiaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ControlAccesoService controlAccesoService;

    @Override
    @Transactional
    public IntegranteFamiliaDto guardar(IntegranteFamiliaDto dto) {
        log.info("Iniciando registro de IntegranteFamilia");

        validar(dto, null);
        IntegranteFamilia registro = new IntegranteFamilia();

        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "IntegranteFamilia",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("IntegranteFamilia guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public IntegranteFamiliaDto editar(Long id, IntegranteFamiliaDto dto) {
        log.info("Editando IntegranteFamilia, id={}", id);
        IntegranteFamilia registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        if (!Objects.equals(registro.getIdFamilia(), dto.getIdFamilia())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idFamilia de un registro existente; anule y cree otro");
        }
        if (!Objects.equals(registro.getIdBeneficiario(), dto.getIdBeneficiario())) {
            throw ExcepcionNegocio.conflicto(
                    "No se puede cambiar idBeneficiario de un registro existente; anule y cree"
                            + " otro");
        }
        IntegranteFamiliaDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "IntegranteFamilia",
                id,
                "EDITAR",
                anterior,
                convertirADto(registro),
                "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public IntegranteFamiliaDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de IntegranteFamilia, id={}", id);
        IntegranteFamilia registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        IntegranteFamiliaDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "IntegranteFamilia",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public IntegranteFamiliaDto consultar(Long id) {
        IntegranteFamilia registro = obtener(id);
        controlAccesoService.validarBeneficiario(registro.getIdBeneficiario());
        return convertirADto(registro);
    }

    @Override
    public Page<IntegranteFamiliaDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<IntegranteFamilia> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private IntegranteFamilia obtener(Long id) {
        Optional<IntegranteFamilia> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("IntegranteFamilia");
        }
        return registro.get();
    }

    private void comprobarVersion(IntegranteFamilia registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(IntegranteFamiliaDto dto, Long id) {
        Optional<Familia> consultarFamilia = familiaRepository.findById(dto.getIdFamilia());
        if (consultarFamilia.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Familia");
        }
        if (!consultarFamilia.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Familia esta inactivo");
        }
        controlAccesoService.validarMunicipio(consultarFamilia.get().getMunicipio());
        Optional<Beneficiario> consultarBeneficiario =
                beneficiarioRepository.findById(dto.getIdBeneficiario());
        if (consultarBeneficiario.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario");
        }
        if (!consultarBeneficiario.get().getActivo()) {
            throw ExcepcionNegocio.conflicto("Beneficiario esta inactivo");
        }
        controlAccesoService.validarBeneficiario(dto.getIdBeneficiario());

        Optional<IntegranteFamilia> existente =
                repository.findByIdFamiliaAndIdBeneficiario(
                        dto.getIdFamilia(), dto.getIdBeneficiario());
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw ExcepcionNegocio.conflicto("Ya existe un registro con esa combinacion de datos");
        }
    }

    private void copiarCampos(IntegranteFamiliaDto dto, IntegranteFamilia registro) {
        registro.setIdFamilia(dto.getIdFamilia());
        registro.setIdBeneficiario(dto.getIdBeneficiario());
        registro.setParentesco(Normalizador.texto(dto.getParentesco()));
    }

    public IntegranteFamiliaDto convertirADto(IntegranteFamilia registro) {
        IntegranteFamiliaDto dto = new IntegranteFamiliaDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setIdFamilia(registro.getIdFamilia());
        dto.setIdBeneficiario(registro.getIdBeneficiario());
        dto.setParentesco(registro.getParentesco());
        return dto;
    }
}
