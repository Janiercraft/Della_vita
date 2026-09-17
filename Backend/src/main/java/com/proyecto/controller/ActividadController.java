package com.proyecto.controller;

import module java.base;

import com.proyecto.dto.ActividadDTO;
import com.proyecto.service.ActividadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Actividad Controller")
@RequestMapping("${application.api.path}")
@CrossOrigin(origins = "*")
@Slf4j
public class ActividadController {

    @Autowired
    ActividadService actividadService;

    @Operation(summary = "Guarda una actividad del proyecto URABA-PAIS")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, guarda la actividad")})
    @PostMapping(value = "/actividades/guardar")
    public ActividadDTO guardar(@RequestBody ActividadDTO dto) {
        System.out.println("CONTROLLER guardarActividad");
        return actividadService.guardar(dto);
    }

    @Operation(summary = "Edita una actividad")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, edita la actividad")})
    @PostMapping(value = "/actividades/editar")
    public ActividadDTO editar(@RequestBody ActividadDTO request) {
        System.out.println("CONTROLLER editarActividad");
        return actividadService.editar(request);
    }

    @Operation(summary = "Cambia el estado activo de la actividad")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, cambia el estado")})
    @PostMapping(value = "/actividades/cambiarEstado")
    public ActividadDTO cambiarEstado(@RequestBody ActividadDTO request) {
        System.out.println("CONTROLLER cambiarEstadoActividad");
        return actividadService.cambiarEstado(request);
    }

    @Operation(summary = "Lista actividades, puede filtrar por resultado R1 R2 R3")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, lista actividades")})
    @PostMapping(value = "/actividades/listar")
    public List<ActividadDTO> listar(@RequestBody(required = false) ActividadDTO request) {
        System.out.println("CONTROLLER listarActividades");
        return actividadService.listar(request);
    }
}
