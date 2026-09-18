package com.proyecto.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamiliaHistorialDto {
    private Long idIntegranteFamilia;
    private Long idFamilia;
    private String nombreFamilia;
    private String municipioFamilia;
    private Long idBeneficiario;
    private String parentesco;
    private Boolean activo;
}
