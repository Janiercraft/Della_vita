package com.proyecto.repository;

import com.proyecto.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.*;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByActivoTrueOrderByFechaInicioAsc();
    List<Evento> findByIdProgramaAndActivoTrueOrderByFechaInicioAsc(Long idPrograma);
    List<Evento> findByIdProgramaAndActivoTrueAndFechaFinGreaterThanEqualOrderByFechaInicioAsc(Long idPrograma, LocalDateTime desde);
}
