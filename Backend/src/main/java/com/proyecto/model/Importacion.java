package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "importacion")
public class Importacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String huella;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private Instant fecha;

    @Column(nullable = false, length = 100)
    private String usuario;

    @Column(nullable = false, columnDefinition = "text")
    private String configuracion;
}
