package com.proyecto.service;

public interface GeminiService {
    boolean estaConfigurado();

    String generarRespuesta(String instrucciones, String pregunta, Object contexto);
}
