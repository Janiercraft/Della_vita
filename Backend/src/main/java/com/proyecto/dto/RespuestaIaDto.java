package com.proyecto.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaIaDto {
    private String respuesta;
    private String proveedor;
    private String tipoConsulta;
    private String rol;
    private Long idBeneficiario;
    private Boolean datosPersonalesProtegidos;
}
