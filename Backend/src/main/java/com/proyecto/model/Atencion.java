package com.proyecto.model;

import module java.base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(schema = "dellavita", name = "ATENCIONES")
public class Atencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ATENCION")
    private Integer idAtencion;

    @ManyToOne
    @JoinColumn(name = "ID_BENEFICIARIO")
    private Beneficiario beneficiario;

    @ManyToOne
    @JoinColumn(name = "ID_ACTIVIDAD")
    private Actividad actividad;

    @Temporal(TemporalType.DATE)
    @Column(name = "FECHA_ATENCION")
    private Date fechaAtencion;

    @Column(name = "TIPO_ATENCION_AYUDA")
    private String tipoAtencionAyuda;

    @Column(name = "ESTADO")
    private String estado;

    @Column(name = "OBSERVACIONES")
    private String observaciones;

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
