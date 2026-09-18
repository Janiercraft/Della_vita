package com.proyecto.service;

import com.proyecto.dto.ResultadoGeneracionIa;

public interface IaGenerativaService {
    ResultadoGeneracionIa generarRespuesta(String instrucciones, String pregunta, Object contexto);
}
