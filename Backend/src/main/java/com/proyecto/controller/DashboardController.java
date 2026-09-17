package com.proyecto.controller;

import com.proyecto.dto.DashboardDTO;
import com.proyecto.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Dashboard Controller")
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
@Slf4j
public class DashboardController {

    @Autowired
    DashboardService dashboardService;

    @Operation(summary = "Consulta el resumen ejecutivo para el hackathon URABA-PAIS")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, genera el dashboard")})
    @PostMapping(value = "/resumen")
    public DashboardDTO consultarResumen() {
        System.out.println("CONTROLLER consultarDashboard");
        return dashboardService.consultarResumen();
    }
}
