package com.proyecto.dto;

import lombok.*;

@Data
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoDTO {
    private String nombreArchivo;
    private String contenidoBase64; // Aquí vendrá el CSV codificad
}
