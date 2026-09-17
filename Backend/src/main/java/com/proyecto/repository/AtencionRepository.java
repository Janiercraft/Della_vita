package com.proyecto.repository;

import module java.base;

import com.proyecto.model.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AtencionRepository extends JpaRepository<Atencion, Integer> {

    /*
     Esta consulta enlista atenciones por beneficiario
     */
    @Query("SELECT a FROM Atencion a WHERE a.beneficiario.idBeneficiario = :idBeneficiario")
    List<Atencion> listarPorBeneficiario(@Param("idBeneficiario") Integer idBeneficiario);

    /*
     Esta consulta enlista atenciones por estado
     */
    @Query("SELECT a FROM Atencion a WHERE a.estado = :estado")
    List<Atencion> listarPorEstado(@Param("estado") String estado);

    /*
     Esta consulta enlista atenciones por municipio del beneficiario
     */
    @Query("SELECT a FROM Atencion a WHERE a.beneficiario.municipio = :municipio")
    List<Atencion> listarPorMunicipio(@Param("municipio") String municipio);

    /*
     Esta consulta enlista atenciones por organizacion
     */
    @Query("SELECT a FROM Atencion a WHERE a.beneficiario.organizacion = :organizacion")
    List<Atencion> listarPorOrganizacion(@Param("organizacion") String organizacion);

    /*
     Esta consulta enlista atenciones por resultado de la actividad
     */
    @Query("SELECT a FROM Atencion a WHERE a.actividad.resultadoAsociado = :resultadoAsociado")
    List<Atencion> listarPorResultado(@Param("resultadoAsociado") String resultadoAsociado);

    /*
     Esta consulta cambia el estado de la atencion
     */
    @Modifying
    @Transactional
    @Query("UPDATE Atencion a SET a.estado = :estado, a.usuarioActualizacion = :usuarioActualizacion, a.dtActualizacion = :dtActualizacion WHERE a.idAtencion = :idAtencion")
    int cambiarEstado(@Param("estado") String estado,
                      @Param("usuarioActualizacion") String usuarioActualizacion,
                      @Param("dtActualizacion") Date dtActualizacion,
                      @Param("idAtencion") Integer idAtencion);

    @Query("SELECT a.estado, COUNT(a) FROM Atencion a GROUP BY a.estado")
    List<Object[]> contarPorEstado();

    @Query("SELECT a.actividad.resultadoAsociado, COUNT(a) FROM Atencion a GROUP BY a.actividad.resultadoAsociado")
    List<Object[]> contarPorResultado();

    @Query("SELECT a.actividad.nombreActividad, COUNT(a) FROM Atencion a GROUP BY a.actividad.nombreActividad")
    List<Object[]> contarPorActividad();

    long countByEstado(String estado);
}
