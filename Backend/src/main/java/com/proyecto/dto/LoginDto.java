package com.proyecto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginDto {
    @NotBlank(message = "Ingrese su correo o nombre de usuario")
    @Size(max = 150)
    private String identificador;

    @NotBlank(message = "Ingrese su contraseña")
    @Size(max = 72)
    private String clave;
}
