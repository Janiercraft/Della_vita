package com.proyecto.repository;

import module java.base;

import com.proyecto.model.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Integer> {

    Beneficiario findByCodigoBeneficiario(String codigoBeneficiario);

    Beneficiario findByNumeroDocumento(String numeroDocumento);

    /*
     Esta consulta enlista beneficiarios activos
     */
    @Query("SELECT b FROM Beneficiario b WHERE b.activo = :activo")
    List<Beneficiario> listarActivo(@Param("activo") Integer activo);

    /*
     Esta consulta filtra por municipio
     */
    @Query("SELECT b FROM Beneficiario b WHERE b.municipio = :municipio")
    List<Beneficiario> listarPorMunicipio(@Param("municipio") String municipio);

    /*
     Esta consulta filtra por organizacion
     */
    @Query("SELECT b FROM Beneficiario b WHERE b.organizacion = :organizacion")
    List<Beneficiario> listarPorOrganizacion(@Param("organizacion") String organizacion);

    /*
     Esta consulta filtra por tipo de poblacion
     */
    @Query("SELECT b FROM Beneficiario b WHERE b.tipoPoblacion = :tipoPoblacion")
    List<Beneficiario> listarPorTipoPoblacion(@Param("tipoPoblacion") String tipoPoblacion);

    /*
     Esta consulta modifica el estado activo
     */
    @Modifying
    @Transactional
    @Query("UPDATE Beneficiario b SET b.activo = :activo WHERE b.idBeneficiario = :idBeneficiario")
    int cambiarEstado(@Param("activo") Integer activo, @Param("idBeneficiario") Integer idBeneficiario);

    @Query("SELECT b.municipio, COUNT(b) FROM Beneficiario b GROUP BY b.municipio")
    List<Object[]> contarPorMunicipio();

    @Query("SELECT b.zona, COUNT(b) FROM Beneficiario b GROUP BY b.zona")
    List<Object[]> contarPorZona();

    @Query("SELECT b.organizacion, COUNT(b) FROM Beneficiario b GROUP BY b.organizacion")
    List<Object[]> contarPorOrganizacion();

    @Query("SELECT b.tipoPoblacion, COUNT(b) FROM Beneficiario b GROUP BY b.tipoPoblacion")
    List<Object[]> contarPorTipoPoblacion();

    @Query("SELECT b.nacionalidad, COUNT(b) FROM Beneficiario b GROUP BY b.nacionalidad")
    List<Object[]> contarPorNacionalidad();
}
