package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeguimientoDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotNull(message = "Falta idParticipacion")
    @Positive
    private Long idParticipacion;

    @NotNull(message = "Falta fechaSeguimiento")
    @PastOrPresent
    private LocalDate fechaSeguimiento;

    private LocalDate fechaProximoSeguimiento;

    @NotBlank(message = "Falta estadoSeguimiento")
    @Pattern(regexp = "PENDIENTE|EN_PROCESO|FINALIZADO")
    private String estadoSeguimiento;

    @Size(max = 2000)
    private String avanceNovedad;

    @Size(max = 2000)
    private String accionPendiente;

    @NotBlank(message = "Falta observaciones")
    @Size(max = 2000)
    private String observaciones;
}
