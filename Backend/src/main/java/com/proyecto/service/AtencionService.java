package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface AtencionService {
    AtencionDto guardar(AtencionDto dto, String claveIdempotencia);

    AtencionDto editar(Long id, AtencionDto dto);

    AtencionDto cambiarEstado(Long id, EstadoDto dto);

    AtencionDto validarAyuda(Long id, ValidacionAyudaDto dto);

    AtencionDto consultar(Long id);

    Page<AtencionDto> listar(Boolean activo, int pagina, int tamanio);
}
