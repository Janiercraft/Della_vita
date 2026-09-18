package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "auditoria")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String entidad;

    @Column(nullable = false)
    private Long idRegistro;

    @Column(nullable = false, length = 80)
    private String operacion;

    @Column(nullable = false, length = 100)
    private String usuario;

    @Column(nullable = false)
    private Instant fecha;

    @Column(nullable = false, columnDefinition = "text")
    private String detalle;
}
