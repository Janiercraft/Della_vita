package com.proyecto.util;

import com.proyecto.exception.ExcepcionNegocio;

import org.springframework.data.domain.*;

public final class Paginacion {
    private Paginacion() {}

    public static Pageable crear(int pagina, int tamanio) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100) {
            throw ExcepcionNegocio.invalido("pagina debe ser >= 0 y tamanio entre 1 y 100");
        }
        return PageRequest.of(pagina, tamanio, Sort.by("id").ascending());
    }
}
