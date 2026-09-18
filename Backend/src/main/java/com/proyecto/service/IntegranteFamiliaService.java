package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface IntegranteFamiliaService {
    IntegranteFamiliaDto guardar(IntegranteFamiliaDto dto);

    IntegranteFamiliaDto editar(Long id, IntegranteFamiliaDto dto);

    IntegranteFamiliaDto cambiarEstado(Long id, EstadoDto dto);

    IntegranteFamiliaDto consultar(Long id);

    Page<IntegranteFamiliaDto> listar(Boolean activo, int pagina, int tamanio);
}
