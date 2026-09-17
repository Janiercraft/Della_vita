package com.proyecto.controller;

import com.proyecto.dto.RespuestaDto;
import com.proyecto.service.AuditoriaService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/auditorias")
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaController {
    private final AuditoriaService servicio;

    @GetMapping
    public RespuestaDto<?> listar(
            @RequestParam String entidad,
            @RequestParam Long idRegistro,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Consulta realizada", servicio.listar(entidad, idRegistro, pagina, tamanio));
    }
}
