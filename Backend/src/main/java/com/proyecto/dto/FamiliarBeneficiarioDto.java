package com.proyecto.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamiliarBeneficiarioDto {
    private Long idIntegrante;
    private Long versionIntegrante;
    private Long idBeneficiario;
    private String primerNombre;
    private String segundoNombre;
    private String primerApellido;
    private String segundoApellido;
    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String parentesco;
    private Boolean tieneDiscapacidad;
    private String discapacidad;
}
