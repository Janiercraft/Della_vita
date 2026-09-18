package com.proyecto.util;

public final class FormatoRespuestaIa {
    private FormatoRespuestaIa() {}

    public static String textoPlano(String texto) {
        if (texto == null || texto.isBlank()) {
            return "";
        }

        String limpio = texto.replace("\r\n", "\n").replace('\r', '\n');

        // Cercas de codigo, encabezados y citas Markdown.
        limpio = limpio.replace("```", "");
        limpio = limpio.replaceAll("(?m)^\\s*#{1,6}\\s*", "");
        limpio = limpio.replaceAll("(?m)^\\s*>\\s?", "");

        // Enlaces Markdown: conserva el texto visible, elimina la sintaxis.
        limpio = limpio.replaceAll("\\[([^\\]]+)]\\(([^)]+)\\)", "$1");

        // Listas Markdown: conserva el contenido sin simbolos decorativos.
        limpio = limpio.replaceAll("(?m)^\\s*[-+*]\\s+", "");

        // Marcadores de enfasis y codigo inline.
        limpio = limpio.replace("**", "");
        limpio = limpio.replace("__", "");
        limpio = limpio.replace("*", "");
        limpio = limpio.replace("`", "");

        // Evita residuos visuales de Markdown y exceso de espacios.
        limpio = limpio.replaceAll("[ \\t]+(?=\\n)", "");
        limpio = limpio.replaceAll("\\n{3,}", "\n\n");

        return limpio.trim();
    }
}
