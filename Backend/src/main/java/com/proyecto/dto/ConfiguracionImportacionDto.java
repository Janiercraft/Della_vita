package com.proyecto.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionImportacionDto {
    // Clave = campo del sistema, valor = encabezado del archivo.
    // Puede quedar vacio: en ese caso el backend intenta detectar columnas automaticamente.
    @Builder.Default
    private Map<String, String> mapeo = new LinkedHashMap<>();

    @Builder.Default
    @NotBlank
    @Pattern(regexp = "AUTO|[,;|\\t]")
    private String separador = "AUTO";

    @Builder.Default
    @Min(0)
    @NotNull(message = "Falta hoja")
    private Integer hoja = 0;
}
