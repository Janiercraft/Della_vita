package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoDto {
    @NotNull(message = "Falta activo")
    private Boolean activo;

    @NotNull(message = "Falta version")
    private Long version;

    @NotBlank(message = "Falta motivo")
    @Size(max = 500)
    private String motivo;
}
