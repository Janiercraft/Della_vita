package com.proyecto.controller;

import com.proyecto.dto.*;
import com.proyecto.service.ImportacionService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/importaciones")
@PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
public class ImportacionController {
    private final ImportacionService servicio;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> cargar(
            @RequestPart MultipartFile archivo,
            @Valid @RequestPart ConfiguracionImportacionDto configuracion,
            @RequestParam(defaultValue = "true") boolean confirmar) {
        return ResponseEntity.status(201)
                .body(
                        RespuestaDto.correcta(
                                "Carga procesada; consulte resultados y reporte",
                                servicio.cargar(archivo, configuracion, confirmar)));
    }

    @PostMapping("/{id}/confirmar")
    public RespuestaDto<?> confirmar(@PathVariable Long id) {
        return RespuestaDto.correcta(
                "Registros validos procesados; consulte el reporte", servicio.confirmar(id));
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

    @GetMapping("/{id}/filas")
    public RespuestaDto<?> filas(
            @PathVariable Long id,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        return RespuestaDto.correcta(
                "Consulta realizada", servicio.listarFilas(id, estado, pagina, tamanio));
    }

    @GetMapping("/{id}/reporte")
    public ResponseEntity<byte[]> reporte(
            @PathVariable Long id, @RequestParam(defaultValue = "false") boolean soloDuplicados) {
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=importacion-" + id + ".csv")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(servicio.reporte(id, soloDuplicados));
    }

    @PostMapping("/{id}/filas/{idFila}/resolver")
    @PreAuthorize("hasRole('ADMIN')")
    public RespuestaDto<?> resolver(
            @PathVariable Long id,
            @PathVariable Long idFila,
            @Valid @RequestBody ResolverFilaDto dto) {
        return RespuestaDto.correcta("Decision registrada", servicio.resolver(id, idFila, dto));
    }
}
