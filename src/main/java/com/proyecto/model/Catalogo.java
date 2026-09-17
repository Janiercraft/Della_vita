package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "catalogo")
public class Catalogo extends RegistroAuditable {
    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @Column(name = "codigo", nullable = false, length = 50)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;
}
