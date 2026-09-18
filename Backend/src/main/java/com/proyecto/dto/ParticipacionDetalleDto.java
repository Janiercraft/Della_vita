package com.proyecto.dto;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipacionDetalleDto {
    private Long id;
    private Long idBeneficiario;
    private Long idPrograma;
    private String nombrePrograma;
    private String lineaIntervencion;
    private String periodo;
    private LocalDate fechaIngreso;
    private String estadoParticipacion;
    private String observaciones;
    private Boolean activo;
}
