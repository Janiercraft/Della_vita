package com.proyecto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaIaDto {
    @NotBlank(message = "Falta pregunta")
    @Size(max = 1000, message = "La pregunta no puede superar 1000 caracteres")
    private String pregunta;

    private Long idBeneficiario;
}
