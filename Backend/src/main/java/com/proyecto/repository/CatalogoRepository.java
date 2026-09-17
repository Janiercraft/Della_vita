package com.proyecto.repository;

import com.proyecto.model.Catalogo;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface CatalogoRepository extends JpaRepository<Catalogo, Long> {
    Page<Catalogo> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Catalogo> findByTipoAndCodigo(String tipo, String codigo);
}
