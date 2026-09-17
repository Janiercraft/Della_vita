package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegranteFamiliaDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotNull(message = "Falta idFamilia")
    @Positive
    private Long idFamilia;

    @NotNull(message = "Falta idBeneficiario")
    @Positive
    private Long idBeneficiario;

    @NotBlank(message = "Falta parentesco")
    @Size(max = 100)
    private String parentesco;
}
