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
public class BeneficiarioDTO {

    private Integer idBeneficiario;

    private String codigoBeneficiario;

    private String tipoDocumento;

    private String numeroDocumento;

    private String nombreCompleto;

    private String sexo;

    private Integer edad;

    private String municipio;

    private String zona;

    private String nacionalidad;

    private String tipoPoblacion;

    private String organizacion;

    private Date fechaRegistro;

    private Boolean activo;

    private Date dtCreacion;

    private Date dtActualizacion;

    private String usuarioCreacion;

    private String usuarioActualizacion;

    private String mensaje;
}
