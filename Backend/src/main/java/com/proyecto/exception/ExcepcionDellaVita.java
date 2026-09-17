package com.proyecto.exception;

import org.springframework.http.HttpStatus;

public class ExcepcionDellaVita extends RuntimeException {

    private final String codigo;
    private final HttpStatus httpStatus;

    public ExcepcionDellaVita(String codigo, HttpStatus httpStatus, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
        this.httpStatus = httpStatus;
    }

    public String getCodigo() {
        return codigo;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
