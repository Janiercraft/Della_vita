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
public class DashboardDTO {

    private Long totalBeneficiarios;

    private Long totalAtenciones;

    private Long pendientes;

    private Long atendidos;

    private Long enSeguimiento;

    private Long finalizados;

    private List<ConteoDTO> porMunicipio;

    private List<ConteoDTO> porZona;

    private List<ConteoDTO> porOrganizacion;

    private List<ConteoDTO> porTipoPoblacion;

    private List<ConteoDTO> porNacionalidad;

    private List<ConteoDTO> porResultado;

    private List<ConteoDTO> porActividad;

    private List<ConteoDTO> porEstado;

    private String mensaje;
}
