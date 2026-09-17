package com.proyecto.service;

import com.proyecto.dto.ResolverFilaDto;

public interface ProcesamientoFilaService {
    void procesar(Long idFila);

    void marcarError(Long idFila, String motivo);

    void resolver(Long idImportacion, Long idFila, ResolverFilaDto dto);
}
