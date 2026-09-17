package com.proyecto.service;

import module java.base;

import com.proyecto.dto.BeneficiarioDTO;

public interface BeneficiarioService {

    BeneficiarioDTO guardar(BeneficiarioDTO dto);

    BeneficiarioDTO editar(BeneficiarioDTO dto);

    BeneficiarioDTO cambiarEstado(BeneficiarioDTO dto);

    List<BeneficiarioDTO> listar(BeneficiarioDTO request);
}
