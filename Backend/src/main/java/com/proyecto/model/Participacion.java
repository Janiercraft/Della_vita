package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "participacion")
public class Participacion extends RegistroAuditable {
    @Column(name = "id_beneficiario", nullable = false)
    private Long idBeneficiario;

    @Column(name = "id_programa", nullable = false)
    private Long idPrograma;

    @Column(name = "periodo", nullable = false, length = 40)
    private String periodo;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "estado_participacion", nullable = false, length = 30)
    private String estadoParticipacion = "INSCRITO";

    @Column(name = "observaciones", nullable = true, length = 2000)
    private String observaciones;
}
