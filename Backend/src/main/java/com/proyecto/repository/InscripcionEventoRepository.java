package com.proyecto.repository;

import com.proyecto.model.InscripcionEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface InscripcionEventoRepository extends JpaRepository<InscripcionEvento, Long> {
    Optional<InscripcionEvento> findByIdEventoAndIdBeneficiario(Long idEvento, Long idBeneficiario);
    List<InscripcionEvento> findByIdBeneficiarioAndActivoTrueOrderByFechaInscripcionDesc(Long idBeneficiario);
    long countByIdEventoAndActivoTrue(Long idEvento);
}
