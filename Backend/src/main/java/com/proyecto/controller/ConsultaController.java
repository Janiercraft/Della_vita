package com.proyecto.controller;

import com.proyecto.dto.RespuestaDto;
import com.proyecto.service.ConsultaService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}")
public class ConsultaController {
    private final ConsultaService servicio;

    @GetMapping("/beneficiarios/{id}/historial")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public RespuestaDto<?> historial(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Historial consultado", servicio.historial(id, pagina, tamanio));
    }

    @GetMapping("/reportes/resumen")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> resumen() {
        return RespuestaDto.correcta(
                "Totales historicos, incluidos inactivos y anulados", servicio.resumen());
    }
}
