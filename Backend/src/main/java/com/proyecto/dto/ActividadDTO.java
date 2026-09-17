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
public class ActividadDTO {

    private Integer idActividad;

    private String nombreActividad;

    private String resultadoAsociado;

    private String descripcionResultado;

    private Boolean activo;

    private Date dtCreacion;

    private Date dtActualizacion;

    private String usuarioCreacion;

    private String usuarioActualizacion;

    private String mensaje;
}
