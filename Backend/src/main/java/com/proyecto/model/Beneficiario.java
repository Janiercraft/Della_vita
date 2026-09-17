package com.proyecto.model;

import module java.base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "dellavita", name = "BENEFICIARIOS")
public class Beneficiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_BENEFICIARIO")
    private Integer idBeneficiario;

    @Column(name = "CODIGO_BENEFICIARIO")
    private String codigoBeneficiario;

    @Column(name = "TIPO_DOCUMENTO")
    private String tipoDocumento;

    @Column(name = "NUMERO_DOCUMENTO")
    private String numeroDocumento;

    @Column(name = "NOMBRE_COMPLETO")
    private String nombreCompleto;

    @Column(name = "SEXO")
    private String sexo;

    @Column(name = "EDAD")
    private Integer edad;

    @Column(name = "MUNICIPIO")
    private String municipio;

    @Column(name = "ZONA")
    private String zona;

    @Column(name = "NACIONALIDAD")
    private String nacionalidad;

    @Column(name = "TIPO_POBLACION")
    private String tipoPoblacion;

    @Column(name = "ORGANIZACION")
    private String organizacion;

    @Temporal(TemporalType.DATE)
    @Column(name = "FECHA_REGISTRO")
    private Date fechaRegistro;

    @Column(name = "ACTIVO")
    private Integer activo;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "DT_CREACION")
    private Date dtCreacion;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "DT_ACTUALIZACION")
    private Date dtActualizacion;

    @Column(name = "USUARIO_CREACION")
    private String usuarioCreacion;

    @Column(name = "USUARIO_ACTUALIZACION")
    private String usuarioActualizacion;
}
