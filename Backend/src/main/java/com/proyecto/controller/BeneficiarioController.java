package com.proyecto.controller;

import module java.base;

import com.proyecto.dto.BeneficiarioDTO;
import com.proyecto.service.BeneficiarioService;
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
@Tag(name = "Beneficiario Controller")
@RequestMapping("${application.api.path}")
@CrossOrigin(origins = "*")
@Slf4j
public class BeneficiarioController {

    @Autowired
    BeneficiarioService beneficiarioService;

    @Operation(summary = "Guarda el registro del beneficiario")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, guarda el beneficiario")})
    @PostMapping(value = "/beneficiarios/guardar")
    public BeneficiarioDTO guardar(@RequestBody BeneficiarioDTO dto) {
        System.out.println("CONTROLLER guardarBeneficiario");
        return beneficiarioService.guardar(dto);
    }

    @Operation(summary = "Edita los datos del beneficiario")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, edita el beneficiario")})
    @PostMapping(value = "/beneficiarios/editar")
    public BeneficiarioDTO editar(@RequestBody BeneficiarioDTO request) {
        System.out.println("CONTROLLER editarBeneficiario");
        return beneficiarioService.editar(request);
    }

    @Operation(summary = "Cambia el estado activo del beneficiario")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, cambia el estado")})
    @PostMapping(value = "/beneficiarios/cambiarEstado")
    public BeneficiarioDTO cambiarEstado(@RequestBody BeneficiarioDTO request) {
        System.out.println("CONTROLLER cambiarEstadoBeneficiario");
        return beneficiarioService.cambiarEstado(request);
    }

    @Operation(summary = "Lista beneficiarios con filtros opcionales")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, lista beneficiarios")})
    @PostMapping(value = "/beneficiarios/listar")
    public List<BeneficiarioDTO> listar(@RequestBody(required = false) BeneficiarioDTO request) {
        System.out.println("CONTROLLER listarBeneficiarios");
        return beneficiarioService.listar(request);
    }
}
