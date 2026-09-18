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

    @Column(name = "descripcion", nullable = true, length = 2000)
    private String descripcion;

    @Column(name = "responsable", nullable = true, length = 200)
    private String responsable;

    @Column(name = "resultado", nullable = true, length = 2000)
    private String resultado;

    @Column(name = "remision", nullable = true, length = 1000)
    private String remision;

    @Column(name = "observaciones", nullable = true, length = 2000)
    private String observaciones;

    @Column(name = "estado_atencion", length = 100)
    private String estadoAtencion;

    @Column(nullable = false, unique = true, length = 100)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String claveIdempotencia;

    @Column(nullable = false, length = 64)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String hashSolicitud;

    @Column(name = "estado_validacion_ayuda", nullable = false, length = 30)
    private String estadoValidacionAyuda = "NO_APLICA";
}
