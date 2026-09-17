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
@Table(schema = "dellavita", name = "ACTIVIDADES")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ACTIVIDAD")
    private Integer idActividad;

    @Column(name = "NOMBRE_ACTIVIDAD")
    private String nombreActividad;

    @Column(name = "RESULTADO_ASOCIADO")
    private String resultadoAsociado;

    @Column(name = "DESCRIPCION_RESULTADO")
    private String descripcionResultado;

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
