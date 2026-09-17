package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface ParticipacionService {
    ParticipacionDto guardar(ParticipacionDto dto);

    ParticipacionDto editar(Long id, ParticipacionDto dto);

    ParticipacionDto cambiarEstado(Long id, EstadoDto dto);

    ParticipacionDto consultar(Long id);

    Page<ParticipacionDto> listar(Boolean activo, int pagina, int tamanio);
}
