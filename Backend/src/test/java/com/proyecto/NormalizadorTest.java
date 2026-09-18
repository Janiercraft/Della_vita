package com.proyecto;

import static org.assertj.core.api.Assertions.assertThat;

import com.proyecto.util.Normalizador;

import org.junit.jupiter.api.Test;

class NormalizadorTest {
    @Test
    void noAceptaMarcadoresComoDocumento() {
        assertThat(Normalizador.documentoValido("SINDOCUMENTO")).isFalse();
        assertThat(Normalizador.documentoValido("0000")).isFalse();
        assertThat(Normalizador.documentoValido("001234")).isTrue();
        assertThat(Normalizador.documentoValido("AB1234")).isTrue();
    }

    @Test
    void conservaCerosInicialesDelDocumento() {
        assertThat(Normalizador.documento(" 00.123-456 ")).isEqualTo("00123456");
    }

    @Test
    void permiteDocumentoAusente() {
        assertThat(Normalizador.documento("  ")).isNull();
        assertThat(Normalizador.documento(null)).isNull();
    }

    @Test
    void normalizaNombresSinCambiarLosOriginales() {
        assertThat(Normalizador.clave("  María   PÉREZ ")).isEqualTo("MARIA PEREZ");
    }

    @Test
    void detectaDistanciaDeEdicion() {
        assertThat(Normalizador.distancia("MARIA PEREZ", "MARA PEREZ")).isEqualTo(1);
        assertThat(Normalizador.distancia("", "ANA")).isEqualTo(3);
    }
}
