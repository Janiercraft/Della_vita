package com.proyecto.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@Table(name = "evento")
public class Evento extends RegistroAuditable {
    @Column(name = "id_programa", nullable = false)
    private Long idPrograma;

    @Column(nullable = false, length = 180)
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Column(nullable = false, length = 250)
    private String lugar;

    @Column
    private Integer cupo;
}
