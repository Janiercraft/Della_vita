package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "integrante_familia")
public class IntegranteFamilia extends RegistroAuditable {
    @Column(name = "id_familia", nullable = false)
    private Long idFamilia;

    @Column(name = "id_beneficiario", nullable = false)
    private Long idBeneficiario;

    @Column(name = "parentesco", nullable = false, length = 100)
    private String parentesco;
}
