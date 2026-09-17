package com.proyecto.controller;

import com.proyecto.dto.BeneficiarioDTO;
import com.proyecto.service.ImportacionService;
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
@Tag(name = "Importacion Controller")
@RequestMapping("${application.api.path}")
@CrossOrigin(origins = "*")
@Slf4j
public class ImportacionController {

    @Autowired
    ImportacionService importacionService;

    @Operation(summary = "Importa la base Base_Beneficiarios_Hackathon al sistema")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Operacion exitosa, importa la base")})
    @PostMapping(value = "/importacion/baseHackathon")
    public BeneficiarioDTO importarBaseHackathon() {
        System.out.println("CONTROLLER importarBaseHackathon");
        return importacionService.importarBaseHackathon();
    }
}
