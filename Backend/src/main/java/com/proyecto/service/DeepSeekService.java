package com.proyecto.service;

public interface DeepSeekService {
    boolean estaConfigurado();

    String generarRespuesta(String instrucciones, String pregunta, Object contexto);
}
