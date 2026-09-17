package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;

@MappedSuperclass
@Getter
@Setter
public abstract class RegistroAuditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version private Long version;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false, updatable = false)
    private Instant dtCreacion;

    private Instant dtActualizacion;

    @Column(nullable = false, updatable = false, length = 100)
    private String usuarioCreacion;

    @Column(length = 100)
    private String usuarioActualizacion;

    @PrePersist
    public void antesDeGuardar() {
        dtCreacion = Instant.now();
        usuarioCreacion = usuarioActual();
    }

    @PreUpdate
    public void antesDeEditar() {
        dtActualizacion = Instant.now();
        usuarioActualizacion = usuarioActual();
    }

    public static String usuarioActual() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null) {
            return "sistema";
        }
        return autenticacion.getName();
    }
}
