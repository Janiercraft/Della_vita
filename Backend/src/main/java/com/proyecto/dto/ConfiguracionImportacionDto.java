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
    @Builder.Default
    private Map<String, String> mapeo = new java.util.LinkedHashMap<>();

    @Builder.Default
    @NotBlank
    @Pattern(regexp = "AUTO|[,;|\\t]")
    private String separador = ",";

    @Builder.Default
    @Min(0)
    @NotNull(message = "Falta hoja")
    private Integer hoja = 0;
}
