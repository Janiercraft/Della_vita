package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface ProgramaService {
    ProgramaDto guardar(ProgramaDto dto);

    ProgramaDto editar(Long id, ProgramaDto dto);

    ProgramaDto cambiarEstado(Long id, EstadoDto dto);

    ProgramaDto consultar(Long id);

    Page<ProgramaDto> listar(Boolean activo, int pagina, int tamanio);
}
