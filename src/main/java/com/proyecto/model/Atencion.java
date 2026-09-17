package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "atencion")
public class Atencion extends RegistroAuditable {
    @Column(name = "id_participacion", nullable = false)
    private Long idParticipacion;

    @Column(name = "fecha_atencion", nullable = false)
    private LocalDate fechaAtencion;

    @Column(name = "tipo_atencion", nullable = false, length = 150)
    private String tipoAtencion;

    @Column(name = "observaciones", nullable = true, length = 2000)
    private String observaciones;

    @Column(nullable = false, unique = true, length = 100)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String claveIdempotencia;

    @Column(nullable = false, length = 64)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String hashSolicitud;
}
