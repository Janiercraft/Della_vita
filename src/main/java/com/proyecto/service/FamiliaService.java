package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface FamiliaService {
    FamiliaDto guardar(FamiliaDto dto);

    FamiliaDto editar(Long id, FamiliaDto dto);

    FamiliaDto cambiarEstado(Long id, EstadoDto dto);

    FamiliaDto consultar(Long id);

    Page<FamiliaDto> listar(Boolean activo, int pagina, int tamanio);
}
