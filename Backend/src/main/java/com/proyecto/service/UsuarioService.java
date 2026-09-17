package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface UsuarioService {
    UsuarioDto guardar(UsuarioDto dto);

    UsuarioDto editar(Long id, UsuarioDto dto);

    UsuarioDto cambiarEstado(Long id, EstadoDto dto);

    UsuarioDto consultar(Long id);

    Page<UsuarioDto> listar(int pagina, int tamanio);
}
