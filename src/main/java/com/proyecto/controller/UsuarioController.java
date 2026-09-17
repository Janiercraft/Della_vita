package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.UsuarioService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("${application.api.path}/usuarios")
public class UsuarioController {
    private final UsuarioService servicio;

    @PostMapping
    public ResponseEntity<?> guardar(@Valid @RequestBody UsuarioDto dto) {
        return ResponseEntity.status(201)
                .body(RespuestaDto.correcta("Se guardo correctamente", servicio.guardar(dto)));
    }

    @PutMapping("/{id}")
    public RespuestaDto<?> editar(@PathVariable Long id, @Valid @RequestBody UsuarioDto dto) {
        return RespuestaDto.correcta("Se actualizo correctamente", servicio.editar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public RespuestaDto<?> cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoDto dto) {
        return RespuestaDto.correcta(
                "Se cambio el estado correctamente", servicio.cambiarEstado(id, dto));
    }

    @GetMapping("/{id}")
    public RespuestaDto<?> consultar(@PathVariable Long id) {
        return RespuestaDto.correcta("Consulta realizada", servicio.consultar(id));
    }

    @GetMapping
    public RespuestaDto<?> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta("Consulta realizada", servicio.listar(pagina, tamanio));
    }
}
