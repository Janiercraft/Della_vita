package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.AsistenteIaService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/ia")
public class AsistenteIaController {
    private final AsistenteIaService servicio;

    @PostMapping("/chat")
    public RespuestaDto<?> preguntar(@Valid @RequestBody ConsultaIaDto dto) {
        return RespuestaDto.correcta("Consulta IA procesada", servicio.preguntar(dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/resumen")
    public RespuestaDto<?> resumen() {
        return RespuestaDto.correcta("Resumen IA generado", servicio.resumenEjecutivo());
    }

    @GetMapping("/sugerencias")
    public RespuestaDto<?> sugerencias() {
        return RespuestaDto.correcta("Sugerencias disponibles", servicio.sugerencias());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/beneficiarios/{idBeneficiario}/chat")
    public RespuestaDto<?> preguntarBeneficiario(
            @PathVariable Long idBeneficiario,
            @Valid @RequestBody ConsultaIaDto dto) {
        return RespuestaDto.correcta(
                "Consulta individual IA procesada",
                servicio.reporteBeneficiario(idBeneficiario, dto));
    }

    @PreAuthorize("hasRole('CONSULTA')")
    @PostMapping("/mi-informacion/chat")
    public RespuestaDto<?> miInformacion(@Valid @RequestBody ConsultaIaDto dto) {
        return RespuestaDto.correcta(
                "Consulta personal IA procesada",
                servicio.miInformacion(dto));
    }

    @PreAuthorize("hasRole('OPERADOR')")
    @PostMapping("/funcionario/chat")
    public RespuestaDto<?> funcionario(@Valid @RequestBody ConsultaIaDto dto) {
        return RespuestaDto.correcta(
                "Consulta del funcionario IA procesada",
                servicio.consultaFuncionario(dto));
    }
}
