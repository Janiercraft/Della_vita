package com.proyecto.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiarioIaUsuarioDto {
    private Long id;
    private String nombreCompleto;
    private String municipio;

    @Builder.Default
    private List<String> programas = new ArrayList<>();

    @Builder.Default
    private List<String> atencionesRecibidas = new ArrayList<>();

    @Builder.Default
    private List<String> seguimientos = new ArrayList<>();
}
