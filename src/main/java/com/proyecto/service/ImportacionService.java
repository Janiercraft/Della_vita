package com.proyecto.service;

import com.proyecto.dto.*;
import com.proyecto.model.FilaImportacion;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface ImportacionService {
    ImportacionDto cargar(
            MultipartFile archivo, ConfiguracionImportacionDto configuracion, boolean confirmar);

    ImportacionDto confirmar(Long id);

    ImportacionDto consultar(Long id);

    Page<ImportacionDto> listar(int pagina, int tamanio);

    Page<FilaImportacion> listarFilas(Long id, String estado, int pagina, int tamanio);

    byte[] reporte(Long id, boolean soloDuplicados);

    ImportacionDto resolver(Long id, Long idFila, ResolverFilaDto dto);
}
