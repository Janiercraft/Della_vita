package com.proyecto.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiarioIaAdminDto {
    private Long id;
    private String codigoInterno;
    private String nombreCompleto;
    private Integer edad;
    private String municipio;
    private String tipoDocumento;
    private String documentoEnmascarado;
    private String celularEnmascarado;
    private String estadoRevisionDuplicidad;
    private String estadoConsentimiento;

    @Builder.Default
    private List<String> programas = new ArrayList<>();

    @Builder.Default
    private List<String> participaciones = new ArrayList<>();

    @Builder.Default
    private List<String> atenciones = new ArrayList<>();

    @Builder.Default
    private List<String> seguimientos = new ArrayList<>();
}
