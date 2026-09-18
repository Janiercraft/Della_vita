package com.proyecto.repository;

import com.proyecto.model.IntegranteFamilia;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface IntegranteFamiliaRepository extends JpaRepository<IntegranteFamilia, Long> {
    Page<IntegranteFamilia> findByActivo(Boolean activo, Pageable paginacion);

    Optional<IntegranteFamilia> findByIdFamiliaAndIdBeneficiario(
            Long idFamilia, Long idBeneficiario);

    Page<IntegranteFamilia> findByIdFamilia(Long idFamilia, Pageable paginacion);

    @Query(
            "select i from IntegranteFamilia i, Beneficiario b where i.idBeneficiario = b.id"
                    + " and (b.id = :idBeneficiario or b.idBeneficiarioPrincipal = :idBeneficiario)"
                    + " and i.activo = true order by i.id")
    List<IntegranteFamilia> consultarPorBeneficiario(
            @org.springframework.data.repository.query.Param("idBeneficiario") Long idBeneficiario);
}
