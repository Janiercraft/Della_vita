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
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "linea_intervencion", nullable = true, length = 150)
    private String lineaIntervencion;

    @Column(name = "descripcion", nullable = true, length = 2000)
    private String descripcion;
}
