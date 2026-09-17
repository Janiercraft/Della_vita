package com.proyecto.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.model.*;
import com.proyecto.repository.AuditoriaRepository;
import com.proyecto.service.AuditoriaService;
import com.proyecto.util.Paginacion;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {
    private final AuditoriaRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void registrar(
            String entidad,
            Long id,
            String operacion,
            Object anterior,
            Object actual,
            String motivo) {
        Auditoria auditoria = new Auditoria();
        auditoria.setEntidad(entidad);
        auditoria.setIdRegistro(id);
        auditoria.setOperacion(operacion);
        auditoria.setUsuario(RegistroAuditable.usuarioActual());
        auditoria.setFecha(Instant.now());
        Map<String, Object> detalle = new LinkedHashMap<>();
        detalle.put("motivo", motivo);
        detalle.put("anterior", anterior);
        detalle.put("actual", actual);
        try {
            auditoria.setDetalle(objectMapper.writeValueAsString(detalle));
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("No fue posible registrar auditoria");
        }
        repository.save(auditoria);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Auditoria> listar(String entidad, Long id, int pagina, int tamanio) {
        return repository.findByEntidadAndIdRegistro(
                entidad, id, Paginacion.crear(pagina, tamanio));
    }
}
