package com.proyecto.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@Table(name = "inscripcion_evento", uniqueConstraints = @UniqueConstraint(name="uq_inscripcion_evento", columnNames={"id_evento","id_beneficiario"}))
public class InscripcionEvento extends RegistroAuditable {
    @Column(name = "id_evento", nullable = false)
    private Long idEvento;

    @Column(name = "id_beneficiario", nullable = false)
    private Long idBeneficiario;

    @Column(name = "fecha_inscripcion", nullable = false)
    private LocalDateTime fechaInscripcion;

    @Column(nullable = false, length = 30)
    private String estado;
}
