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
@Table(name = "beneficiario")
public class Beneficiario extends RegistroAuditable {
    @Column(name = "primer_nombre", nullable = false, length = 100)
    private String primerNombre;

    @Column(name = "segundo_nombre", nullable = true, length = 100)
    private String segundoNombre;

    @Column(name = "primer_apellido", nullable = false, length = 100)
    private String primerApellido;

    @Column(name = "segundo_apellido", nullable = true, length = 100)
    private String segundoApellido;

    @Column(name = "tipo_documento", nullable = true, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = true, length = 40)
    private String numeroDocumento;

    @Column(name = "fecha_nacimiento", nullable = true)
    private LocalDate fechaNacimiento;

    @Column(name = "celular", nullable = true, length = 30)
    private String celular;

    @Column(name = "municipio", nullable = true, length = 150)
    private String municipio;

    @Column(name = "direccion", nullable = true, length = 250)
    private String direccion;

    @Column(name = "codigo_origen", length = 100)
    private String codigoOrigen;

    @Column(name = "nombre_completo_original", length = 450)
    private String nombreCompletoOriginal;

    @Column(name = "sexo", length = 50)
    private String sexo;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "zona", length = 100)
    private String zona;

    @Column(name = "nacionalidad", length = 100)
    private String nacionalidad;

    @Column(name = "tipo_poblacion", length = 150)
    private String tipoPoblacion;

    @Column(name = "organizacion_origen", length = 200)
    private String organizacionOrigen;

    @Column(name = "fecha_registro_origen")
    private LocalDate fechaRegistroOrigen;

    @Column(nullable = false, unique = true, length = 40)
    private String codigoInterno;

    private Long idBeneficiarioPrincipal;

    @Column(nullable = false, length = 450)
    private String nombreNormalizado;

    @Column(name = "estado_revision_duplicidad", nullable = false, length = 40)
    private String estadoRevisionDuplicidad = "APROBADO";

    @Column(name = "estado_consentimiento", nullable = false, length = 30)
    private String estadoConsentimiento = "PENDIENTE";
}
