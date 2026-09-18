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
@Table(name = "seguimiento")
public class Seguimiento extends RegistroAuditable {
    @Column(name = "id_participacion", nullable = false)
    private Long idParticipacion;

    @Column(name = "fecha_seguimiento", nullable = false)
    private LocalDate fechaSeguimiento;

    @Column(name = "fecha_proximo_seguimiento", nullable = true)
    private LocalDate fechaProximoSeguimiento;

    @Column(name = "estado_seguimiento", nullable = false, length = 255)
    private String estadoSeguimiento;

    @Column(name = "avance_novedad", nullable = true, length = 2000)
    private String avanceNovedad;

    @Column(name = "accion_pendiente", nullable = true, length = 2000)
    private String accionPendiente;

    @Column(name = "responsable", nullable = true, length = 200)
    private String responsable;

    @Column(name = "observaciones", nullable = false, length = 2000)
    private String observaciones;

    @Column(nullable = false, unique = true, length = 100)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String claveIdempotencia;

    @Column(nullable = false, length = 64)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String hashSolicitud;
}
