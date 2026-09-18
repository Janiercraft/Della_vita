package com.proyecto.exception;

import com.proyecto.dto.RespuestaDto;

import jakarta.validation.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.*;

@RestControllerAdvice
@Slf4j
public class ManejadorExcepciones {
    @ExceptionHandler(ExcepcionNegocio.class)
    public ResponseEntity<?> negocio(ExcepcionNegocio error) {
        log.warn("Operacion rechazada: {}", error.getMessage());
        return ResponseEntity.status(error.getEstado())
                .body(RespuestaDto.correcta(error.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validacion(MethodArgumentNotValidException error) {
        Map<String, String> campos = new LinkedHashMap<>();
        error.getBindingResult()
                .getFieldErrors()
                .forEach(campo -> campos.put(campo.getField(), campo.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(RespuestaDto.correcta("Revise los parametros indicados", campos));
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        ConstraintViolationException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class,
        MissingServletRequestPartException.class
    })
    public ResponseEntity<?> formato(Exception error) {
        return ResponseEntity.badRequest()
                .body(
                        RespuestaDto.correcta(
                                "Solicitud incompleta o formato invalido; consulte el contrato de"
                                        + " la API",
                                null));
    }

    @ExceptionHandler({
        DataIntegrityViolationException.class,
        ObjectOptimisticLockingFailureException.class
    })
    public ResponseEntity<?> conflicto(Exception error) {
        log.warn(
                "Conflicto de integridad o edicion concurrente: {}",
                error.getClass().getSimpleName());
        return ResponseEntity.status(409)
                .body(
                        RespuestaDto.correcta(
                                "El registro ya existe, tiene relaciones incompatibles o fue"
                                        + " modificado. Actualice la consulta",
                                null));
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<?> autenticacion(Exception error) {
        return ResponseEntity.status(401)
                .body(RespuestaDto.correcta("Usuario o clave incorrectos", null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> permisos(Exception error) {
        return ResponseEntity.status(403)
                .body(RespuestaDto.correcta("No tiene permiso para esta operacion", null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> archivo(Exception error) {
        return ResponseEntity.status(413)
                .body(RespuestaDto.correcta("El archivo supera el limite de 10 MB", null));
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> metodo(Exception error) {
        return ResponseEntity.status(405)
                .body(RespuestaDto.correcta("Metodo HTTP no permitido para esta ruta", null));
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<?> contenido(Exception error) {
        return ResponseEntity.status(415)
                .body(
                        RespuestaDto.correcta(
                                "Tipo de contenido no admitido; revise Content-Type", null));
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<?> ruta(Exception error) {
        return ResponseEntity.status(404)
                .body(RespuestaDto.correcta("La ruta solicitada no existe", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> inesperado(Exception error) {
        // No escribir datos personales, SQL ni credenciales en la respuesta o en los logs.
        log.error(
                "Fallo no controlado, tipo={}, origen={}",
                error.getClass().getName(),
                error.getStackTrace().length == 0 ? "desconocido" : error.getStackTrace()[0]);
        return ResponseEntity.internalServerError()
                .body(
                        RespuestaDto.correcta(
                                "No fue posible completar la operacion; informe el solicitudId",
                                null));
    }
}
