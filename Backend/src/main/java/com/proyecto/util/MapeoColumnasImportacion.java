package com.proyecto.util;

import java.text.Normalizer;
import java.util.*;

public final class MapeoColumnasImportacion {
    private MapeoColumnasImportacion() {}

    private static final Map<String, List<String>> ALIAS = crearAlias();

    public static Map<String, String> detectar(Collection<String> encabezados) {
        Map<String, String> normalizados = new LinkedHashMap<>();
        for (String encabezado : encabezados) {
            normalizados.put(normalizar(encabezado), encabezado);
        }
        Map<String, String> resultado = new LinkedHashMap<>();
        ALIAS.forEach((campo, aliases) -> {
            for (String alias : aliases) {
                String encontrado = normalizados.get(normalizar(alias));
                if (encontrado != null) {
                    resultado.put(campo, encontrado);
                    break;
                }
            }
        });
        return resultado;
    }

    public static List<String> noReconocidas(Collection<String> encabezados, Map<String, String> mapeo) {
        Set<String> usadas = new HashSet<>(mapeo.values());
        return encabezados.stream().filter(e -> !usadas.contains(e)).toList();
    }

    private static Map<String, List<String>> crearAlias() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("nombreCompleto", List.of("nombre completo", "nombres y apellidos", "nombre_completo", "nombre"));
        m.put("primerNombre", List.of("primer nombre", "primer_nombre", "nombre1", "nombre 1"));
        m.put("segundoNombre", List.of("segundo nombre", "segundo_nombre", "nombre2", "nombre 2"));
        m.put("primerApellido", List.of("primer apellido", "primer_apellido", "apellido1", "apellido 1"));
        m.put("segundoApellido", List.of("segundo apellido", "segundo_apellido", "apellido2", "apellido 2"));
        m.put("tipoDocumento", List.of("tipo documento", "tipo_documento", "tipo de documento", "tipodocumento"));
        m.put("numeroDocumento", List.of("numero documento", "numero_documento", "número documento", "número de documento", "documento", "cedula", "cédula", "cc"));
        m.put("fechaNacimiento", List.of("fecha nacimiento", "fecha_nacimiento", "fecha de nacimiento", "nacimiento"));
        m.put("celular", List.of("celular", "telefono", "teléfono", "telefono celular", "movil", "móvil"));
        m.put("municipio", List.of("municipio", "ciudad"));
        m.put("direccion", List.of("direccion", "dirección", "domicilio"));
        return Collections.unmodifiableMap(m);
    }

    private static String normalizar(String valor) {
        if (valor == null) return "";
        String s = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
        return s.replaceAll("\\s+", " ");
    }
}
