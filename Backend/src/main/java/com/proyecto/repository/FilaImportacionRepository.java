package com.proyecto.repository;

import com.proyecto.model.FilaImportacion;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface FilaImportacionRepository extends JpaRepository<FilaImportacion, Long> {
    List<FilaImportacion> findByIdImportacionOrderByNumeroFila(Long idImportacion);

    @Query(
            "select f.id from FilaImportacion f where f.idImportacion = :id and f.estado = 'NUEVO'"
                    + " order by f.numeroFila")
    List<Long> consultarPendientesDeProcesar(@Param("id") Long id);

    Page<FilaImportacion> findByIdImportacion(Long idImportacion, Pageable pagina);

    Page<FilaImportacion> findByIdImportacionAndEstado(
            Long idImportacion, String estado, Pageable pagina);

    @Query(
            "select f.estado, count(f) from FilaImportacion f where f.idImportacion = :id group by"
                    + " f.estado")
    List<Object[]> contarResultados(@Param("id") Long id);
}
