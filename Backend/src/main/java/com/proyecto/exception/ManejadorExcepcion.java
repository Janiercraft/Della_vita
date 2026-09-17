package com.proyecto.exception;

import module java.base;

import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class ManejadorExcepcion {

    @ExceptionHandler(ExcepcionDellaVita.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionDellaVita(ExcepcionDellaVita excepcion) {
        System.out.println("ERROR controlado: codigo=" + excepcion.getCodigo() + " mensaje=" + excepcion.getMessage());
        log.error("Error de negocio: {} - {}", excepcion.getCodigo(), excepcion.getMessage());

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("codigo", excepcion.getCodigo());
        cuerpo.put("mensaje", excepcion.getMessage());
        cuerpo.put("estado", excepcion.getHttpStatus().value());

        return new ResponseEntity<>(cuerpo, excepcion.getHttpStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionGeneral(Exception excepcion) {
        System.out.println("ERROR no controlado: " + excepcion.getMessage());
        log.error("Error no controlado", excepcion);

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("codigo", MensajesCTE.COD0099);
        cuerpo.put("mensaje", MensajesCTE.ERROR_NO_CONTROLADO);
        cuerpo.put("detalle", excepcion.getMessage());
        cuerpo.put("estado", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return new ResponseEntity<>(cuerpo, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
