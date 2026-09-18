package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/eventos")
public class EventoController {
    private final EventoService servicio;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','CONSULTA')")
    public RespuestaDto<?> listar(@RequestParam(required=false) Long idPrograma, @RequestParam(defaultValue="true") Boolean soloActivos) {
        return RespuestaDto.correcta("Consulta realizada", servicio.listar(idPrograma, soloActivos));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crear(@Valid @RequestBody EventoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(RespuestaDto.correcta("Evento creado correctamente", servicio.crear(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> editar(@PathVariable Long id, @Valid @RequestBody EventoDto dto) {
        return RespuestaDto.correcta("Evento actualizado correctamente", servicio.editar(id, dto));
    }

    @PostMapping("/postularme/{idPrograma}")
    @PreAuthorize("hasRole('CONSULTA')")
    public RespuestaDto<?> postularme(@PathVariable Long idPrograma) {
        return RespuestaDto.correcta("Postulacion registrada y eventos vinculados automaticamente", servicio.postularme(idPrograma));
    }

    @PostMapping("/{idEvento}/postularme")
    @PreAuthorize("hasRole('CONSULTA')")
    public RespuestaDto<?> postularmeEvento(@PathVariable Long idEvento) {
        return RespuestaDto.correcta("Postulacion al evento registrada", servicio.postularmeEvento(idEvento));
    }

    @DeleteMapping("/{idEvento}/mi-inscripcion")
    @PreAuthorize("hasRole('CONSULTA')")
    public RespuestaDto<?> cancelarMiInscripcionEvento(@PathVariable Long idEvento) {
        return RespuestaDto.correcta("Postulacion al evento cancelada", servicio.cancelarMiInscripcionEvento(idEvento));
    }

    @GetMapping("/mis-eventos")
    @PreAuthorize("hasRole('CONSULTA')")
    public RespuestaDto<?> misEventos() {
        return RespuestaDto.correcta("Eventos del beneficiario", servicio.misEventos());
    }

    @GetMapping("/mis-participaciones")
    @PreAuthorize("hasRole('CONSULTA')")
    public RespuestaDto<?> misParticipaciones() {
        return RespuestaDto.correcta("Participaciones del beneficiario", servicio.misParticipaciones());
    }
}
