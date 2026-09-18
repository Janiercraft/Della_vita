package com.proyecto.dto;

import lombok.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenIaDto {
    private Long beneficiariosRegistrados;
    private Long programasRegistrados;
    private Long participacionesRegistradas;
    private Long atencionesRegistradas;
    private Long seguimientosRegistrados;
    private Long seguimientosPendientes;

    @Builder.Default
    private Map<String, Long> beneficiariosPorMunicipio = new LinkedHashMap<>();
}
