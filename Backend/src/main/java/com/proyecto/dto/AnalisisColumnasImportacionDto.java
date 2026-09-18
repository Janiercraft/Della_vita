package com.proyecto.dto;

import lombok.*;
import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalisisColumnasImportacionDto {
    private String archivo;
    @Builder.Default
    private List<String> columnasDetectadas = new ArrayList<>();
    @Builder.Default
    private Map<String, String> mapeoDetectado = new LinkedHashMap<>();
    @Builder.Default
    private List<String> columnasNoReconocidas = new ArrayList<>();
}
