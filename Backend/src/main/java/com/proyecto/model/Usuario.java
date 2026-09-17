package com.proyecto.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "usuario")
public class Usuario extends RegistroAuditable {
    @Column(nullable = false, unique = true, length = 100)
    private String nombreUsuario;

    @Column(nullable = false, length = 200)
    private String nombreCompleto;

    @JsonIgnore
    @Column(nullable = false, length = 100)
    private String clave;

    @Column(nullable = false, length = 20)
    private String rol;
}
