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
public class CatalogoServiceImpl implements CatalogoService {
    private final CatalogoRepository repository;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public CatalogoDto guardar(CatalogoDto dto) {
        log.info("Iniciando registro de Catalogo");

        validar(dto, null);
        Catalogo registro = new Catalogo();

        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Catalogo",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Catalogo guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public CatalogoDto editar(Long id, CatalogoDto dto) {
        log.info("Editando Catalogo, id={}", id);
        Catalogo registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        CatalogoDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Catalogo", id, "EDITAR", anterior, convertirADto(registro), "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public CatalogoDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Catalogo, id={}", id);
        Catalogo registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        CatalogoDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Catalogo",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public CatalogoDto consultar(Long id) {
        return convertirADto(obtener(id));
    }

    @Override
    public Page<CatalogoDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Catalogo> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Catalogo obtener(Long id) {
        Optional<Catalogo> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Catalogo");
        }
        return registro.get();
    }

    private void comprobarVersion(Catalogo registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(CatalogoDto dto, Long id) {

        Optional<Catalogo> existente =
                repository.findByTipoAndCodigo(
                        Normalizador.texto(dto.getTipo()), Normalizador.texto(dto.getCodigo()));
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw ExcepcionNegocio.conflicto("Ya existe un registro con esa combinacion de datos");
        }
    }

    private void copiarCampos(CatalogoDto dto, Catalogo registro) {
        registro.setTipo(Normalizador.texto(dto.getTipo()));
        registro.setCodigo(Normalizador.texto(dto.getCodigo()));
        registro.setNombre(Normalizador.texto(dto.getNombre()));
    }

    public CatalogoDto convertirADto(Catalogo registro) {
        CatalogoDto dto = new CatalogoDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setTipo(registro.getTipo());
        dto.setCodigo(registro.getCodigo());
        dto.setNombre(registro.getNombre());
        return dto;
    }
}
