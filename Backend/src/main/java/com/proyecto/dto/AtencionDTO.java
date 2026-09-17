package com.proyecto.dto;

import module java.base;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtencionDTO {

    private Integer idAtencion;

    private Integer idBeneficiario;

    private String codigoBeneficiario;

    private String nombreCompleto;

    private String municipio;

    private String organizacion;

    private Integer idActividad;

    private String nombreActividad;

    private String resultadoAsociado;

    private Date fechaAtencion;

    private String tipoAtencionAyuda;

    private String estado;

    private String observaciones;

    private Date dtCreacion;

    private Date dtActualizacion;

    private String usuarioCreacion;

    private String usuarioActualizacion;

    private String mensaje;
}
