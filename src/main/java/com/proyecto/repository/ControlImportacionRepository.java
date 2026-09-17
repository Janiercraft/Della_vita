package com.proyecto.repository;

import com.proyecto.model.ControlImportacion;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;

public interface ControlImportacionRepository extends JpaRepository<ControlImportacion, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ControlImportacion c where c.id = 1")
    ControlImportacion bloquearProcesamiento();
}
