package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "fila_importacion")
public class FilaImportacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long idImportacion;

    @Column(nullable = false)
    private Integer numeroFila;

    @Column(nullable = false, columnDefinition = "text")
    private String originales;

    @Column(nullable = false, columnDefinition = "text")
    private String normalizados;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(nullable = false, length = 2000)
    private String motivo;

    private Long idBeneficiario;

    @Column(length = 2000)
    private String candidatos;
}
