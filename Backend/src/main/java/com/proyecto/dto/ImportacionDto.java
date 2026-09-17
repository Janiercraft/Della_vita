package com.proyecto.dto;

import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportacionDto {
    private Long id;
    private String nombreArchivo;
    private Instant fecha;
    private String estado;
    private long total;
    private Map<String, Long> resultados;
}
