package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.SeguimientoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Seguimiento")
@RequestMapping("${application.api.path}/seguimientos")
public class SeguimientoController {
    private final SeguimientoService servicio;

    @PostMapping
    @Operation(summary = "Guardar Seguimiento")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<?> guardar(
            @Valid @RequestBody SeguimientoDto dto,
            @RequestHeader("Idempotency-Key") String claveIdempotencia) {
        SeguimientoDto guardado = servicio.guardar(dto, claveIdempotencia);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RespuestaDto.correcta("Se guardo correctamente", guardado));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar Seguimiento; requiere version actual")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> editar(@PathVariable Long id, @Valid @RequestBody SeguimientoDto dto) {
        return RespuestaDto.correcta("Se actualizo correctamente", servicio.editar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar, desactivar o anular con motivo")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoDto dto) {
        return RespuestaDto.correcta(
                "Se cambio el estado correctamente", servicio.cambiarEstado(id, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> consultar(@PathVariable Long id) {
        return RespuestaDto.correcta("Consulta realizada", servicio.consultar(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> listar(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Consulta realizada", servicio.listar(activo, pagina, tamanio));
    }
}
