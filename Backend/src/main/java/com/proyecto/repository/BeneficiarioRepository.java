package com.proyecto.repository;

import com.proyecto.model.Beneficiario;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {
    List<Beneficiario> findByIdBeneficiarioPrincipal(Long idBeneficiarioPrincipal);

    long countByIdBeneficiarioPrincipalIsNull();

    long countByIdBeneficiarioPrincipalIsNullAndActivoTrue();

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Beneficiario b where b.id in :ids order by b.id")
    List<Beneficiario> bloquearParaUnificar(@Param("ids") List<Long> ids);

    Page<Beneficiario> findByActivo(Boolean activo, Pageable paginacion);

    Optional<Beneficiario> findByTipoDocumentoAndNumeroDocumento(
            String tipoDocumento, String numeroDocumento);

    List<Beneficiario> findTop20ByNombreNormalizadoOrderById(String nombreNormalizado);

    List<Beneficiario> findTop10ByNombreNormalizadoContainingOrderById(String nombreNormalizado);

    @Query("select b.municipio, count(b) from Beneficiario b where b.idBeneficiarioPrincipal is null group by b.municipio order by count(b) desc")
    List<Object[]> contarBeneficiariosPorMunicipio();

    @Query(
            "select b from Beneficiario b where (b.nombreNormalizado like :inicio or"
                    + " b.nombreNormalizado like :apellido) and (b.numeroDocumento is null or"
                    + " :sinDocumento = true) order by b.id")
    List<Beneficiario> buscarCandidatos(
            @Param("inicio") String inicio,
            @Param("apellido") String apellido,
            @Param("sinDocumento") boolean sinDocumento,
            Pageable limite);


    List<Beneficiario> findByEstadoRevisionDuplicidadOrderByDtCreacionAsc(
            String estadoRevisionDuplicidad);

    List<Beneficiario> findByNombreNormalizadoAndFechaNacimientoOrderById(
            String nombreNormalizado, java.time.LocalDate fechaNacimiento);

    @Query(
            "select b from Beneficiario b where lower(b.municipio) = lower(:municipio) and"
                    + " (:activo is null or b.activo = :activo) and"
                    + " (:nombre = '' or b.nombreNormalizado like concat('%', :nombre, '%')) and"
                    + " (:documento = '' or b.numeroDocumento = :documento)")
    Page<Beneficiario> buscarBeneficiariosPorMunicipio(
            @Param("municipio") String municipio,
            @Param("nombre") String nombre,
            @Param("documento") String documento,
            @Param("activo") Boolean activo,
            Pageable paginacion);

    @Query(
            "select b from Beneficiario b where (:activo is null or b.activo = :activo) and"
                    + " (:nombre = '' or b.nombreNormalizado like concat('%', :nombre, '%')) and"
                    + " (:documento = '' or b.numeroDocumento = :documento)")
    Page<Beneficiario> buscarBeneficiarios(
            @Param("nombre") String nombre,
            @Param("documento") String documento,
            @Param("activo") Boolean activo,
            Pageable paginacion);
}
