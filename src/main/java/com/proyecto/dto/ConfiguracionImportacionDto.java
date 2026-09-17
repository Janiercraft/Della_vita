package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionImportacionDto {
    // Clave = campo del sistema, valor = encabezado del archivo.
    @NotEmpty(message = "Falta mapeo de columnas")
    private Map<String, String> mapeo;

    @Builder.Default
    @NotBlank
    @Pattern(regexp = "[,;|\\t]")
    private String separador = ",";

    @Builder.Default
    @Min(0)
    @NotNull(message = "Falta hoja")
    private Integer hoja = 0;
}
