package com.proyecto.controller;

import com.proyecto.dto.ActividadDTO;
import com.proyecto.dto.BeneficiarioDTO;
import com.proyecto.dto.ArchivoDTO;
import com.proyecto.service.ImportacionService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Tag(name = "Importacion Controller")
@RequestMapping("/api/beneficiarios")
@CrossOrigin(origins = "*")
@Slf4j
public class ImportacionController {

    @Autowired
    ImportacionService importacionService; // O ImportacionService, según cómo lo hayas nombrado

    @PostMapping("/importar")
    public ResponseEntity<BeneficiarioDTO> importarBaseCsvJson(
            @RequestBody ArchivoDTO actividadDTO) {

        BeneficiarioDTO respuesta = importacionService.importarBaseHackathon(actividadDTO);
        return ResponseEntity.ok(respuesta);
    }
}
