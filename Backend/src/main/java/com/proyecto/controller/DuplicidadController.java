package com.proyecto.controller;

import com.proyecto.dto.DecisionDuplicidadDto;
import com.proyecto.dto.RespuestaDto;
import com.proyecto.service.DuplicidadService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("${application.api.path}/duplicidades")
public class DuplicidadController {
    private final DuplicidadService servicio;

    @GetMapping
    public RespuestaDto<?> listarPendientes() {
        return RespuestaDto.correcta("Posibles duplicados pendientes de revision", servicio.listarPendientes());
    }

    @GetMapping("/{idBeneficiario}/candidatos")
    public RespuestaDto<?> candidatos(@PathVariable Long idBeneficiario) {
        return RespuestaDto.correcta("Candidatos encontrados", servicio.candidatos(idBeneficiario));
    }

    @PostMapping("/{idBeneficiario}/resolver")
    public RespuestaDto<?> resolver(
            @PathVariable Long idBeneficiario,
            @Valid @RequestBody DecisionDuplicidadDto dto) {
        return RespuestaDto.correcta("Decision de duplicidad registrada", servicio.resolver(idBeneficiario, dto));
    }
}
