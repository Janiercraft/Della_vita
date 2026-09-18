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
public class ProgramaServiceImpl implements ProgramaService {
    private final ProgramaRepository repository;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public ProgramaDto guardar(ProgramaDto dto) {
        log.info("Iniciando registro de Programa");

        validar(dto, null);
        Programa registro = new Programa();

        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Programa",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Programa guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public ProgramaDto editar(Long id, ProgramaDto dto) {
        log.info("Editando Programa, id={}", id);
        Programa registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        ProgramaDto anterior = convertirADto(registro);
        validar(dto, id);
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Programa", id, "EDITAR", anterior, convertirADto(registro), "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public ProgramaDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Programa, id={}", id);
        Programa registro = obtener(id);
        comprobarVersion(registro, dto.getVersion());
        ProgramaDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Programa",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public ProgramaDto consultar(Long id) {
        return convertirADto(obtener(id));
    }

    @Override
    public Page<ProgramaDto> listar(Boolean activo, int pagina, int tamanio) {
        Page<Programa> registros;
        if (activo == null) {
            registros = repository.findAll(Paginacion.crear(pagina, tamanio));
        } else {
            registros = repository.findByActivo(activo, Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }

    private Programa obtener(Long id) {
        Optional<Programa> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Programa");
        }
        return registro.get();
    }

    private void comprobarVersion(Programa registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(ProgramaDto dto, Long id) {

        Optional<Programa> existente = repository.findByNombre(Normalizador.texto(dto.getNombre()));
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw ExcepcionNegocio.conflicto("Ya existe un registro con esa combinacion de datos");
        }
    }

    private void copiarCampos(ProgramaDto dto, Programa registro) {
        registro.setNombre(Normalizador.texto(dto.getNombre()));
        registro.setLineaIntervencion(Normalizador.texto(dto.getLineaIntervencion()));
        registro.setDescripcion(Normalizador.texto(dto.getDescripcion()));
    }

    public ProgramaDto convertirADto(Programa registro) {
        ProgramaDto dto = new ProgramaDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setNombre(registro.getNombre());
        dto.setLineaIntervencion(registro.getLineaIntervencion());
        dto.setDescripcion(registro.getDescripcion());
        return dto;
    }
}
