package com.proyecto.exception;

import lombok.Getter;

import org.springframework.http.HttpStatus;

@Getter
public class ExcepcionNegocio extends RuntimeException {
    private final HttpStatus estado;

    public ExcepcionNegocio(HttpStatus estado, String mensaje) {
        super(mensaje);
        this.estado = estado;
    }

    public static ExcepcionNegocio noEncontrado(String entidad) {
        return new ExcepcionNegocio(HttpStatus.NOT_FOUND, entidad + " no encontrado");
    }

    public static ExcepcionNegocio conflicto(String mensaje) {
        return new ExcepcionNegocio(HttpStatus.CONFLICT, mensaje);
    }

    public static ExcepcionNegocio invalido(String mensaje) {
        return new ExcepcionNegocio(HttpStatus.BAD_REQUEST, mensaje);
    }

    public static ExcepcionNegocio servicioNoDisponible(String mensaje) {
        return new ExcepcionNegocio(HttpStatus.SERVICE_UNAVAILABLE, mensaje);
    }
}
