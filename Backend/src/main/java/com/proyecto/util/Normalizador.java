package com.proyecto.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

public final class Normalizador {
    private Normalizador() {}

    public static boolean documentoValido(String numeroDocumento) {
        if (numeroDocumento == null) {
            return true;
        }
        Set<String> marcadoresAusentes =
                Set.of(
                        "SINDOCUMENTO",
                        "SINCEDULA",
                        "NORECUERDA",
                        "NOAPLICA",
                        "NULL",
                        "NONE",
                        "DESCONOCIDO",
                        "PENDIENTE");
        return numeroDocumento.matches("[A-Z0-9]{3,40}")
                && !numeroDocumento.matches("0+")
                && !marcadoresAusentes.contains(numeroDocumento);
    }

    public static String texto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim().replaceAll("\\s+", " ");
    }

    public static String clave(String valor) {
        String limpio = texto(valor);
        if (limpio == null) {
            return "";
        }
        return Normalizer.normalize(limpio, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
    }

    public static int distancia(String primero, String segundo) {
        int[] anterior = new int[segundo.length() + 1];
        for (int indice = 0; indice <= segundo.length(); indice++) {
            anterior[indice] = indice;
        }
        for (int fila = 1; fila <= primero.length(); fila++) {
            int[] actual = new int[segundo.length() + 1];
            actual[0] = fila;
            for (int columna = 1; columna <= segundo.length(); columna++) {
                int costo = primero.charAt(fila - 1) == segundo.charAt(columna - 1) ? 0 : 1;
                actual[columna] =
                        Math.min(
                                Math.min(actual[columna - 1] + 1, anterior[columna] + 1),
                                anterior[columna - 1] + costo);
            }
            anterior = actual;
        }
        return anterior[segundo.length()];
    }

    public static String documento(String valor) {
        String limpio = texto(valor);
        if (limpio == null) {
            return null;
        }
        return limpio.toUpperCase(Locale.ROOT).replaceAll("[.\\s-]", "");
    }
}
