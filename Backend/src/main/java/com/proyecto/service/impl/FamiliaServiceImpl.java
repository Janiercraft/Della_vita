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
public class FamiliaServiceImpl implements FamiliaService {
    private final FamiliaRepository repository;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public FamiliaDto guardar(FamiliaDto dto) {
        log.info("Iniciando registro de Familia");

        validar(dto, null);
        Familia registro = new Familia();

        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Familia",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Familia guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public FamiliaDto editar(Long id, FamiliaDto dto) {
        log.info("Editando Familia, id={}", id);
        Familia registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        FamiliaDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Familia", id, "EDITAR", anterior, convertirADto(registro), "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public FamiliaDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Familia, id={}", id);
        Familia registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        FamiliaDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Familia",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public FamiliaDto consultar(Long id) {
        return convertirADto(obtener(id));
    }

    @Override
    public Page<FamiliaDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Familia> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Familia obtener(Long id) {
        Optional<Familia> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Familia");
        }
        return registro.get();
    }

    private void comprobarVersion(Familia registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(FamiliaDto dto, Long id) {}

    private void copiarCampos(FamiliaDto dto, Familia registro) {
        registro.setNombre(Normalizador.texto(dto.getNombre()));
        registro.setDireccion(Normalizador.texto(dto.getDireccion()));
        registro.setMunicipio(Normalizador.texto(dto.getMunicipio()));
    }

    public FamiliaDto convertirADto(Familia registro) {
        FamiliaDto dto = new FamiliaDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setNombre(registro.getNombre());
        dto.setDireccion(registro.getDireccion());
        dto.setMunicipio(registro.getMunicipio());
        return dto;
    }
}
