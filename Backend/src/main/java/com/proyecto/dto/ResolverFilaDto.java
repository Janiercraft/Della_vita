package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolverFilaDto {
    @NotBlank
    @Pattern(regexp = "CREAR|VINCULAR|OMITIR")
    private String accion;

    private Long idBeneficiario;

    @NotBlank
    @Size(max = 500)
    private String motivo;
}
