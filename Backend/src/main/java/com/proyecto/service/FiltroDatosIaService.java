package com.proyecto.service;

import com.proyecto.dto.BeneficiarioIaAdminDto;
import com.proyecto.dto.BeneficiarioIaUsuarioDto;
import com.proyecto.dto.FuncionarioIaDto;
import com.proyecto.dto.ResumenIaDto;

public interface FiltroDatosIaService {
    ResumenIaDto prepararResumenSeguro();

    BeneficiarioIaAdminDto prepararBeneficiarioAdmin(Long idBeneficiario);

    BeneficiarioIaUsuarioDto prepararBeneficiarioUsuario(Long idBeneficiario);

    FuncionarioIaDto prepararFuncionario(String nombreUsuario);
}
