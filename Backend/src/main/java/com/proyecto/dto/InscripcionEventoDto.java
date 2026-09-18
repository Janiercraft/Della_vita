package com.proyecto.dto;

import lombok.*;
import java.time.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class InscripcionEventoDto {
    private Long id;
    private Long idEvento;
    private Long idBeneficiario;
    private String nombreEvento;
    private LocalDateTime fechaInicio;
    private String lugar;
    private LocalDateTime fechaInscripcion;
    private String estado;
}
