package com.proyecto.repository;

import com.proyecto.model.Programa;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface ProgramaRepository extends JpaRepository<Programa, Long> {
    Page<Programa> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Programa> findByNombre(String nombre);
}
