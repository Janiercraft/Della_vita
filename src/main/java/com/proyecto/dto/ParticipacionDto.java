package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipacionDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotNull(message = "Falta idBeneficiario")
    @Positive
    private Long idBeneficiario;

    @NotNull(message = "Falta idPrograma")
    @Positive
    private Long idPrograma;

    @NotBlank(message = "Falta periodo")
    @Size(max = 40)
    private String periodo;

    @NotNull(message = "Falta fechaIngreso")
    @PastOrPresent
    private LocalDate fechaIngreso;

    @Size(max = 2000)
    private String observaciones;
}
