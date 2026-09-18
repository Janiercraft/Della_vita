package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "programa")
public class Programa extends RegistroAuditable {
    @Column(name = "codigo", nullable = true, unique = true, length = 40)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "codigo_linea", nullable = true, length = 40)
    private String codigoLinea;

    @Column(name = "linea_intervencion", nullable = true, length = 150)
    private String lineaIntervencion;

    @Column(name = "organizacion_lider", nullable = true, length = 250)
    private String organizacionLider;

    @Column(name = "meta_estimada")
    private Integer metaEstimada;

    @Column(name = "descripcion", nullable = true, length = 2000)
    private String descripcion;
}
