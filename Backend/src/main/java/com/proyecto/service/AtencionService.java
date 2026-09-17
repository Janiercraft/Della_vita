package com.proyecto.service;

import module java.base;

import com.proyecto.dto.AtencionDTO;

public interface AtencionService {

    AtencionDTO guardar(AtencionDTO dto);

    AtencionDTO editar(AtencionDTO dto);

    AtencionDTO cambiarEstado(AtencionDTO dto);

    List<AtencionDTO> listar(AtencionDTO request);

    List<AtencionDTO> listarPorBeneficiario(AtencionDTO request);
}
