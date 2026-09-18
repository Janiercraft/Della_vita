package com.proyecto.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuncionarioIaDto {
    private String nombreUsuario;
    private String nombreCompleto;
    private String municipioAsignado;
    private Integer totalAtenciones;
    private Integer totalSeguimientos;
    private Integer atencionesHoy;
    private Integer atencionesSemana;
    private Integer seguimientosHoy;
    private Integer seguimientosSemana;

    @Builder.Default
    private List<String> atencionesRealizadas = new ArrayList<>();

    @Builder.Default
    private List<String> seguimientosRealizados = new ArrayList<>();
}
