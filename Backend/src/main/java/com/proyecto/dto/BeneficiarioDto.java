package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.*;
import java.util.*;

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


    @Size(max = 150)
    private String grupoPoblacional;

    @Size(max = 150)
    private String pertenenciaEtnica;

    private Boolean jefaturaHogar;

    private Boolean tieneDiscapacidad;

    @Size(max = 500)
    private String discapacidad;

    @Size(max = 2000)
    private String observaciones;

    @Builder.Default
    private List<FamiliarBeneficiarioDto> familiares = new ArrayList<>();

    private Integer cantidadFamiliares;

    private String codigoInterno;
    private Long idBeneficiarioPrincipal;
    private String estadoRevisionDuplicidad;
    private String estadoConsentimiento;
}
