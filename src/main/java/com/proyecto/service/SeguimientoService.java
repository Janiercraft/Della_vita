package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface SeguimientoService {
    SeguimientoDto guardar(SeguimientoDto dto, String claveIdempotencia);

    SeguimientoDto editar(Long id, SeguimientoDto dto);

    SeguimientoDto cambiarEstado(Long id, EstadoDto dto);

    SeguimientoDto consultar(Long id);

    Page<SeguimientoDto> listar(Boolean activo, int pagina, int tamanio);
}
