package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotBlank(message = "Falta tipo")
    @Size(max = 50)
    private String tipo;

    @NotBlank(message = "Falta codigo")
    @Size(max = 50)
    private String codigo;

    @NotBlank(message = "Falta nombre")
    @Size(max = 150)
    private String nombre;
}
