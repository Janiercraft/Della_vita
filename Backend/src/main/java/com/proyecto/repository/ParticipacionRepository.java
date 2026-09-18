package com.proyecto.repository;

import com.proyecto.model.Participacion;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface ParticipacionRepository extends JpaRepository<Participacion, Long> {
    Page<Participacion> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Participacion> findByIdBeneficiarioAndIdProgramaAndPeriodo(
            Long idBeneficiario, Long idPrograma, String periodo);

    @Query(
            "select pr.nombre, count(p.id) from Participacion p, Programa pr where p.idPrograma = pr.id"
                    + " and p.activo = true and pr.activo = true group by pr.nombre order by pr.nombre")
    List<Object[]> contarParticipacionesActivasPorPrograma();

    @Query(
            "select p from Participacion p, Beneficiario b where p.idBeneficiario = b.id and (b.id"
                    + " = :idBeneficiario or b.idBeneficiarioPrincipal = :idBeneficiario)")
    Page<Participacion> findByIdBeneficiario(
            @Param("idBeneficiario") Long idBeneficiario, Pageable paginacion);
}
