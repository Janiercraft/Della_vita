package com.proyecto.service;

import com.proyecto.dto.ConfiguracionImportacionDto;

public interface PreparacionImportacionService {
    Long preparar(
            String nombreArchivo, byte[] contenido, ConfiguracionImportacionDto configuracion);
}
