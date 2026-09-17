package com.proyecto.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDto {
    private Long id;
    private Long version;
    private Boolean activo;

    @NotBlank
    @Pattern(regexp = "[a-zA-Z0-9._-]{3,100}")
    private String nombreUsuario;

    @NotBlank
    @Size(max = 200)
    private String nombreCompleto;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 12, max = 72)
    private String clave;

    @NotBlank
    @Pattern(regexp = "ADMIN|OPERADOR|CONSULTA")
    private String rol;
}
