package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.UnificacionService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/beneficiarios")
public class UnificacionController {
    private final UnificacionService servicio;

    @PostMapping("/unificar")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> unificar(@Valid @RequestBody UnificacionDto dto) {
        return RespuestaDto.correcta(
                "Fichas unificadas; se conservaron las relaciones y el historial originales",
                servicio.unificar(dto));
    }
}
