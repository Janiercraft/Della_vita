package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface CatalogoService {
    CatalogoDto guardar(CatalogoDto dto);

    CatalogoDto editar(Long id, CatalogoDto dto);

    CatalogoDto cambiarEstado(Long id, EstadoDto dto);

    CatalogoDto consultar(Long id);

    Page<CatalogoDto> listar(Boolean activo, int pagina, int tamanio);
}
