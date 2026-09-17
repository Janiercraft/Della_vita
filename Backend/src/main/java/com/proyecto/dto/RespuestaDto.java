package com.proyecto.dto;

import lombok.*;

import org.slf4j.MDC;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaDto<T> {
    private String mensaje;
    private T datos;
    private Instant fecha;
    private String solicitudId;

    public static <T> RespuestaDto<T> correcta(String mensaje, T datos) {
        return new RespuestaDto<>(mensaje, datos, Instant.now(), MDC.get("solicitudId"));
    }
}
