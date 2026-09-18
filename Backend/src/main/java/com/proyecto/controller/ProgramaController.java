package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.ProgramaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Programa")
@RequestMapping("${application.api.path}/programas")
public class ProgramaController {
    private final ProgramaService servicio;

    @PostMapping
    @Operation(summary = "Guardar Programa")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> guardar(@Valid @RequestBody ProgramaDto dto) {
        ProgramaDto guardado = servicio.guardar(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RespuestaDto.correcta("Se guardo correctamente", guardado));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar Programa; requiere version actual")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> editar(@PathVariable Long id, @Valid @RequestBody ProgramaDto dto) {
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
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> listar(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Consulta realizada", servicio.listar(activo, pagina, tamanio));
    }
}
