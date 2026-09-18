package com.proyecto.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EventoDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;

    @NotNull @Positive
    private Long idPrograma;
    @NotBlank @Size(max=180)
    private String nombre;
    @Size(max=2000)
    private String descripcion;
    @NotNull
    private LocalDateTime fechaInicio;
    @NotNull
    private LocalDateTime fechaFin;
    @NotBlank @Size(max=250)
    private String lugar;
    @PositiveOrZero
    private Integer cupo;
    private Long inscritos;
}
