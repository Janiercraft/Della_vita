package com.proyecto.service;

import com.proyecto.model.Auditoria;

import org.springframework.data.domain.Page;

public interface AuditoriaService {
    void registrar(
            String entidad,
            Long id,
            String operacion,
            Object anterior,
            Object actual,
            String motivo);

    Page<Auditoria> listar(String entidad, Long id, int pagina, int tamanio);
}
