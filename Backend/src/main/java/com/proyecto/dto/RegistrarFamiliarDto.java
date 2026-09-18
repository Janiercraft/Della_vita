package com.proyecto.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarFamiliarDto {
    @NotNull(message = "Faltan datos del familiar")
    @Valid
    private BeneficiarioDto beneficiario;

    @NotBlank(message = "Falta parentesco")
    @Size(max = 100)
    private String parentesco;

    @Min(0)
    @Max(130)
    private Integer edad;
}
