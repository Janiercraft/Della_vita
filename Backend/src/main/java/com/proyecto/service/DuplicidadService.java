package com.proyecto.service;

import com.proyecto.dto.BeneficiarioDto;
import com.proyecto.dto.DecisionDuplicidadDto;

import java.util.List;

public interface DuplicidadService {
    List<BeneficiarioDto> listarPendientes();

    List<BeneficiarioDto> candidatos(Long idBeneficiario);

    BeneficiarioDto resolver(Long idBeneficiario, DecisionDuplicidadDto dto);
}
