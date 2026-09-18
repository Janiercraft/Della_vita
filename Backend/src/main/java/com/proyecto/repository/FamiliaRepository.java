package com.proyecto.repository;

import com.proyecto.model.Familia;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface FamiliaRepository extends JpaRepository<Familia, Long> {
    Page<Familia> findByActivo(Boolean activo, Pageable paginacion);
    Page<Familia> findByMunicipioIgnoreCase(String municipio, Pageable paginacion);
    Page<Familia> findByMunicipioIgnoreCaseAndActivo(String municipio, Boolean activo, Pageable paginacion);
}
