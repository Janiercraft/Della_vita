package com.proyecto.repository;

import com.proyecto.model.Auditoria;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    Page<Auditoria> findByEntidadAndIdRegistro(
            String entidad, Long idRegistro, Pageable paginacion);
}
