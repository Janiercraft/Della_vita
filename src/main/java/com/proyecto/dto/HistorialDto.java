package com.proyecto.dto;

import com.proyecto.model.*;

import lombok.*;

import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialDto {
    private BeneficiarioDto beneficiario;
    private Page<Participacion> participaciones;
    private Page<Atencion> atenciones;
    private Page<Seguimiento> seguimientos;
}
