package com.proyecto.service;

import com.proyecto.dto.ConfiguracionImportacionDto;

import java.util.*;

public interface LectorArchivoService {
    boolean soporta(String nombreArchivo);

    List<Map<String, String>> leer(byte[] contenido, ConfiguracionImportacionDto configuracion);
}
