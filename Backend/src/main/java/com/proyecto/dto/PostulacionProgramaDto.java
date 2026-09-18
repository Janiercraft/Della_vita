package com.proyecto.dto;

import lombok.*;
import java.util.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PostulacionProgramaDto {
    private ParticipacionDto participacion;
    private List<InscripcionEventoDto> eventosVinculados;
    private int cantidadEventosVinculados;
}
