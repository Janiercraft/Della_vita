package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "familia")
public class Familia extends RegistroAuditable {
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "direccion", nullable = true, length = 250)
    private String direccion;

    @Column(name = "municipio", nullable = true, length = 150)
    private String municipio;
}
