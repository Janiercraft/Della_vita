package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionDuplicidadDto {
    @NotNull private Long version;

    @NotBlank
    @Pattern(regexp = "ACEPTAR|DESCARTAR|FUSIONAR")
    private String accion;

    private Long idDestino;
    private Long versionDestino;

    @NotBlank
    @Size(max = 500)
    private String motivo;
}
