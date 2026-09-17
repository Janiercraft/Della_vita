package com.proyecto.service;

import com.proyecto.dto.HistorialDto;

import java.util.Map;

public interface ConsultaService {
    HistorialDto historial(Long id, int pagina, int tamanio);

    Map<String, Long> resumen();
}
