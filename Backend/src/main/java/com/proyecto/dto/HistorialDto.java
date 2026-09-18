package com.proyecto.dto;

import com.proyecto.model.*;

import lombok.*;

import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialDto {
    private BeneficiarioDto beneficiario;

    // Se conservan los campos existentes para no romper consumidores actuales.
    private Page<Participacion> participaciones;
    private Page<Atencion> atenciones;
    private Page<Seguimiento> seguimientos;

    // Campos adicionales requeridos por la guia del reto.
    private List<FamiliaHistorialDto> familia;
    private Page<ParticipacionDetalleDto> participacionesDetalle;
}
