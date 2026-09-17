package com.proyecto.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "control_importacion")
public class ControlImportacion {
    @Id private Long id;
}
