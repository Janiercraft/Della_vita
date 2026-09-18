package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiarioDto {
    private Long id;
    private Long version;
    private Boolean activo;
    private Instant dtCreacion;
    private Instant dtActualizacion;
    private String usuarioCreacion;
    private String usuarioActualizacion;

    @NotBlank(message = "Falta primerNombre")
    @Size(max = 100)
    private String primerNombre;

    @Size(max = 100)
    private String segundoNombre;

    @NotBlank(message = "Falta primerApellido")
    @Size(max = 100)
    private String primerApellido;

    @Size(max = 100)
    private String segundoApellido;

    @Size(max = 20)
    private String tipoDocumento;

    @Size(max = 40)
    private String numeroDocumento;

    @PastOrPresent private LocalDate fechaNacimiento;

    @Size(max = 30)
    private String celular;

    @Size(max = 150)
    private String municipio;

    @Size(max = 250)
    private String direccion;

    private String codigoInterno;
    private Long idBeneficiarioPrincipal;
    private String estadoRevisionDuplicidad;
    private String estadoConsentimiento;
}
