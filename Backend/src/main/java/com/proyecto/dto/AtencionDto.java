package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtencionDto {
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

    @NotNull(message = "Falta fechaAtencion")
    @PastOrPresent
    private LocalDate fechaAtencion;

    @NotBlank(message = "Falta tipoAtencion")
    @Size(max = 150)
    private String tipoAtencion;

    @Size(max = 2000)
    private String descripcion;

    @Size(max = 200)
    private String responsable;

    @Size(max = 2000)
    private String resultado;

    @Size(max = 1000)
    private String remision;

    @Size(max = 2000)
    private String observaciones;

    private String estadoValidacionAyuda;
}
