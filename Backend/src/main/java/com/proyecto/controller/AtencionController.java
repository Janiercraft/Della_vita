package com.proyecto.controller;

import module java.base;

import com.proyecto.dto.AtencionDTO;
import com.proyecto.service.AtencionService;
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
@Tag(name = "Atencion Controller")
@RequestMapping("${application.api.path}")
@CrossOrigin(origins = "*")
@Slf4j
public class AtencionController {

    @Autowired
    AtencionService atencionService;

    @Operation(summary = "Registra una atencion o ayuda a un beneficiario")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, guarda la atencion")})
    @PostMapping(value = "/atenciones/guardar")
    public AtencionDTO guardar(@RequestBody AtencionDTO dto) {
        System.out.println("CONTROLLER guardarAtencion");
        return atencionService.guardar(dto);
    }

    @Operation(summary = "Edita una atencion")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, edita la atencion")})
    @PostMapping(value = "/atenciones/editar")
    public AtencionDTO editar(@RequestBody AtencionDTO request) {
        System.out.println("CONTROLLER editarAtencion");
        return atencionService.editar(request);
    }

    @Operation(summary = "Cambia el estado de la atencion: Pendiente, Atendido, En seguimiento, Finalizado")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, cambia el estado")})
    @PostMapping(value = "/atenciones/cambiarEstado")
    public AtencionDTO cambiarEstado(@RequestBody AtencionDTO request) {
        System.out.println("CONTROLLER cambiarEstadoAtencion");
        return atencionService.cambiarEstado(request);
    }

    @Operation(summary = "Lista atenciones con filtros por estado, municipio, organizacion o resultado")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, lista atenciones")})
    @PostMapping(value = "/atenciones/listar")
    public List<AtencionDTO> listar(@RequestBody(required = false) AtencionDTO request) {
        System.out.println("CONTROLLER listarAtenciones");
        return atencionService.listar(request);
    }

    @Operation(summary = "Lista las atenciones de un beneficiario")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, lista por beneficiario")})
    @PostMapping(value = "/atenciones/listarPorBeneficiario")
    public List<AtencionDTO> listarPorBeneficiario(@RequestBody AtencionDTO request) {
        System.out.println("CONTROLLER listarAtencionesPorBeneficiario");
        return atencionService.listarPorBeneficiario(request);
    }
}
