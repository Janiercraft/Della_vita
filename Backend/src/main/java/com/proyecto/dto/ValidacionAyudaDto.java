package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionAyudaDto {
    @NotNull private Long version;

    @NotBlank
    @Pattern(regexp = "PENDIENTE|VALIDADA|RECHAZADA")
    private String estado;

    @NotBlank
    @Size(max = 500)
    private String motivo;
}
