package com.proyecto.service.impl;

import com.proyecto.dto.ConfiguracionImportacionDto;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.service.LectorArchivoService;

import org.apache.commons.csv.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.*;
import java.nio.charset.*;
import java.util.*;

@Service
public class LectorCsvServiceImpl implements LectorArchivoService {
    @Value("${application.importacion.max-filas}")
    private int maxFilas;

    @Override
    public boolean soporta(String nombre) {
        return nombre.toLowerCase(Locale.ROOT).endsWith(".csv");
    }

    @Override
    public List<Map<String, String>> leer(
            byte[] contenido, ConfiguracionImportacionDto configuracion) {
        List<Map<String, String>> filas = new ArrayList<>();
        try {
            String texto =
                    StandardCharsets.UTF_8
                            .newDecoder()
                            .onMalformedInput(CodingErrorAction.REPORT)
                            .decode(ByteBuffer.wrap(contenido))
                            .toString();
            if (texto.startsWith("\uFEFF")) {
                texto = texto.substring(1);
            }
            char separador = detectarSeparador(texto, configuracion.getSeparador());
            CSVFormat formato =
                    CSVFormat.DEFAULT
                            .builder()
                            .setDelimiter(separador)
                            .setHeader()
                            .setSkipHeaderRecord(true)
                            .setIgnoreEmptyLines(false)
                            .setDuplicateHeaderMode(DuplicateHeaderMode.DISALLOW)
                            .get();
            try (CSVParser parser = formato.parse(new StringReader(texto))) {
                validarEncabezados(parser.getHeaderNames(), configuracion);
                for (CSVRecord registro : parser) {
                    if (filas.size() >= maxFilas) {
                        throw ExcepcionNegocio.invalido("El archivo supera " + maxFilas + " filas");
                    }
                    Map<String, String> fila = new LinkedHashMap<>();
                    if (!registro.isConsistent()) {
                        fila.put(
                                "__error",
                                "La cantidad de columnas no coincide con los encabezados");
                        fila.put("__original", registro.toString());
                    } else {
                        fila.putAll(registro.toMap());
                    }
                    filas.add(fila);
                }
            }
            return filas;
        } catch (ExcepcionNegocio error) {
            throw error;
        } catch (Exception error) {
            throw ExcepcionNegocio.invalido(
                    "CSV invalido: use UTF-8, encabezados unicos y el separador configurado");
        }
    }

    private char detectarSeparador(String texto, String configurado) {
        if (configurado != null && !configurado.equalsIgnoreCase("AUTO")) {
            return configurado.charAt(0);
        }
        String primera = texto.lines().findFirst().orElse("");
        char[] candidatos = new char[] {',', ';', '\t', '|'};
        char mejor = ',';
        int max = -1;
        for (char candidato : candidatos) {
            int conteo = 0;
            boolean comillas = false;
            for (int i = 0; i < primera.length(); i++) {
                char c = primera.charAt(i);
                if (c == '"') comillas = !comillas;
                else if (!comillas && c == candidato) conteo++;
            }
            if (conteo > max) {
                max = conteo;
                mejor = candidato;
            }
        }
        return mejor;
    }

    public static void validarEncabezados(
            List<String> encabezados, ConfiguracionImportacionDto configuracion) {
        if (encabezados.isEmpty()
                || encabezados.size() > 200
                || encabezados.stream().anyMatch(valor -> valor.isBlank() || valor.startsWith("__"))
                || new HashSet<>(encabezados).size() != encabezados.size()) {
            throw ExcepcionNegocio.invalido(
                    "Use de 1 a 200 encabezados no vacios, unicos y sin prefijo reservado __");
        }
        for (String columna : configuracion.getMapeo().values()) {
            if (!encabezados.contains(columna)) {
                throw ExcepcionNegocio.invalido("No se encontro la columna mapeada: " + columna);
            }
        }
    }
}
