package com.proyecto.service;

import com.proyecto.dto.ConsultaIaDto;
import com.proyecto.dto.RespuestaIaDto;

import java.util.List;

public interface AsistenteIaService {
    RespuestaIaDto preguntar(ConsultaIaDto dto);

    RespuestaIaDto reporteBeneficiario(Long idBeneficiario, ConsultaIaDto dto);

    RespuestaIaDto miInformacion(ConsultaIaDto dto);

    RespuestaIaDto consultaFuncionario(ConsultaIaDto dto);

    RespuestaIaDto resumenEjecutivo();

    List<String> sugerencias();
}
