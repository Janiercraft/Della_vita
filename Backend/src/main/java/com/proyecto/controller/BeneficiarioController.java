package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.BeneficiarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Beneficiario")
@RequestMapping("${application.api.path}/beneficiarios")
public class BeneficiarioController {
    private final BeneficiarioService servicio;

    @PostMapping
    @Operation(summary = "Guardar Beneficiario")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<?> guardar(@Valid @RequestBody BeneficiarioDto dto) {
        BeneficiarioDto guardado = servicio.guardar(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RespuestaDto.correcta("Se guardo correctamente", guardado));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar Beneficiario; requiere version actual")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> editar(@PathVariable Long id, @Valid @RequestBody BeneficiarioDto dto) {
        return RespuestaDto.correcta("Se actualizo correctamente", servicio.editar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar, desactivar o anular con motivo")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoDto dto) {
        return RespuestaDto.correcta(
                "Se cambio el estado correctamente", servicio.cambiarEstado(id, dto));
    }


    @PatchMapping("/{id}/consentimiento")
    @Operation(summary = "Actualizar estado de consentimiento informado")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> cambiarConsentimiento(
            @PathVariable Long id, @Valid @RequestBody ConsentimientoDto dto) {
        return RespuestaDto.correcta(
                "Estado de consentimiento actualizado", servicio.cambiarConsentimiento(id, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> consultar(@PathVariable Long id) {
        return RespuestaDto.correcta("Consulta realizada", servicio.consultar(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> listar(
            @RequestParam(defaultValue = "") String nombre,
            @RequestParam(defaultValue = "") String documento,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Consulta realizada", servicio.listar(nombre, documento, activo, pagina, tamanio));
    }
}
