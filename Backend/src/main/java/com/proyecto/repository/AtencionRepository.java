package com.proyecto.repository;

import com.proyecto.model.Atencion;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface AtencionRepository extends JpaRepository<Atencion, Long> {
    Page<Atencion> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Atencion> findByClaveIdempotencia(String claveIdempotencia);

    @Query(
            "select e from Atencion e, Participacion p, Beneficiario b where e.idParticipacion ="
                    + " p.id and p.idBeneficiario = b.id and (b.id = :idBeneficiario or"
                    + " b.idBeneficiarioPrincipal = :idBeneficiario)")
    Page<Atencion> consultarPorBeneficiario(
            @Param("idBeneficiario") Long idBeneficiario, Pageable pagina);

    Page<Atencion> findByIdParticipacion(Long idParticipacion, Pageable paginacion);

    Page<Atencion> findByUsuarioCreacion(String usuarioCreacion, Pageable paginacion);

    long countByUsuarioCreacion(String usuarioCreacion);
}
