package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnificacionDto {
    @NotNull @Positive private Long idOrigen;
    @NotNull @Positive private Long idDestino;
    @NotNull private Long versionOrigen;
    @NotNull private Long versionDestino;

    @NotBlank
    @Size(max = 500)
    private String motivo;
}
