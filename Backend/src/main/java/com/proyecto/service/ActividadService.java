package com.proyecto.service;

import module java.base;

import com.proyecto.dto.ActividadDTO;

public interface ActividadService {

    ActividadDTO guardar(ActividadDTO dto);

    ActividadDTO editar(ActividadDTO dto);

    ActividadDTO cambiarEstado(ActividadDTO dto);

    List<ActividadDTO> listar(ActividadDTO request);
}
