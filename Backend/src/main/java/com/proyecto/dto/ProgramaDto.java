package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramaDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotBlank(message = "Falta nombre")
    @Size(max = 150)
    private String nombre;

    @Size(max = 2000)
    private String descripcion;
}
