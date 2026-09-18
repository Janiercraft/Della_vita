package com.proyecto.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsentimientoDto {
    @NotNull private Long version;

    @NotBlank
    @Pattern(regexp = "PENDIENTE|OTORGADO|RECHAZADO|REVOCADO")
    private String estado;

    @Size(max = 500)
    private String motivo;
}
