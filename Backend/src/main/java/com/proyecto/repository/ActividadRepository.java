package com.proyecto.repository;

import module java.base;

import com.proyecto.model.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Integer> {

    Actividad findByNombreActividad(String nombreActividad);

    /*
     Esta consulta enlista actividades activas
     */
    @Query("SELECT a FROM Actividad a WHERE a.activo = :activo")
    List<Actividad> listarActivo(@Param("activo") Integer activo);

    /*
     Esta consulta filtra por resultado R1, R2 o R3
     */
    @Query("SELECT a FROM Actividad a WHERE a.resultadoAsociado = :resultadoAsociado")
    List<Actividad> listarPorResultado(@Param("resultadoAsociado") String resultadoAsociado);

    /*
     Esta consulta modifica el estado activo
     */
    @Modifying
    @Transactional
    @Query("UPDATE Actividad a SET a.activo = :activo WHERE a.idActividad = :idActividad")
    int cambiarEstado(@Param("activo") Integer activo, @Param("idActividad") Integer idActividad);
}
