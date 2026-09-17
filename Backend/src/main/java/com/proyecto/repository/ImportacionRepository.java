package com.proyecto.repository;

import com.proyecto.model.Importacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImportacionRepository extends JpaRepository<Importacion, Long> {
    Optional<Importacion> findByHuella(String huella);
}
