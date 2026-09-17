package com.proyecto.repository;

import com.proyecto.model.Seguimiento;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {
    Page<Seguimiento> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Seguimiento> findByClaveIdempotencia(String claveIdempotencia);

    @Query(
            "select e from Seguimiento e, Participacion p, Beneficiario b where e.idParticipacion ="
                    + " p.id and p.idBeneficiario = b.id and (b.id = :idBeneficiario or"
                    + " b.idBeneficiarioPrincipal = :idBeneficiario)")
    Page<Seguimiento> consultarPorBeneficiario(
            @Param("idBeneficiario") Long idBeneficiario, Pageable pagina);

    Page<Seguimiento> findByIdParticipacion(Long idParticipacion, Pageable paginacion);
}
