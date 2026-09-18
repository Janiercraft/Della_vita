package com.proyecto.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.service.GeminiService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiServiceImpl implements GeminiService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelo;

    public GeminiServiceImpl(
            RestClient.Builder builder,
            ObjectMapper objectMapper,
            @Value("${application.gemini.url:https://generativelanguage.googleapis.com}") String url,
            @Value("${application.gemini.api-key:}") String apiKey,
            @Value("${application.gemini.modelo:gemini-3.6-flash}") String modelo) {
        this.restClient = builder.baseUrl(url).build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.modelo = modelo;
    }

    @Override
    public String generarRespuesta(String instrucciones, String pregunta, Object contexto) {
        if (apiKey == null || apiKey.isBlank()) {
            throw ExcepcionNegocio.invalido(
                    "Gemini no esta configurado. Defina GEMINI_API_KEY en las variables de entorno");
        }

        log.info("Enviando consulta segura a Gemini, modelo={}", modelo);

        String contextoJson = convertirContextoAJson(contexto);
        String texto =
                instrucciones
                        + "\n\nPREGUNTA DEL USUARIO:\n"
                        + pregunta
                        + "\n\nCONTEXTO AUTORIZADO POR EL BACKEND (JSON):\n"
                        + contextoJson;

        Map<String, Object> cuerpo =
                Map.of(
                        "contents",
                        List.of(
                                Map.of(
                                        "role",
                                        "user",
                                        "parts",
                                        List.of(Map.of("text", texto)))),
                        "generationConfig",
                        Map.of("temperature", 0.2, "maxOutputTokens", 1200));

        try {
            JsonNode respuesta =
                    restClient
                            .post()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/v1beta/models/{modelo}:generateContent")
                                                    .build(modelo))
                            .header("x-goog-api-key", apiKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cuerpo)
                            .retrieve()
                            .body(JsonNode.class);

            if (respuesta == null) {
                throw new IllegalStateException("Gemini respondio sin contenido");
            }

            JsonNode textoRespuesta = respuesta.at("/candidates/0/content/parts/0/text");
            if (textoRespuesta.isMissingNode() || textoRespuesta.asText().isBlank()) {
                throw new IllegalStateException("Gemini no genero una respuesta util");
            }
            return limpiarFormatoMarkdown(textoRespuesta.asText());
        } catch (ExcepcionNegocio error) {
            throw error;
        } catch (Exception error) {
            log.warn("No fue posible completar la consulta con Gemini, tipo={}", error.getClass().getSimpleName());
            throw new IllegalStateException("No fue posible consultar el asistente IA en este momento");
        }
    }

    /**
     * Convierte la salida generada por Gemini a texto plano para que el frontend no muestre
     * marcadores de Markdown como **, *, # o ``` de forma literal.
     */
    private String limpiarFormatoMarkdown(String texto) {
        if (texto == null || texto.isBlank()) {
            return "";
        }

        String limpio = texto.replace("\r\n", "\n").replace('\r', '\n');

        // Elimina bloques/cercas de codigo y encabezados Markdown.
        limpio = limpio.replace("```", "");
        limpio = limpio.replaceAll("(?m)^\\s*#{1,6}\\s*", "");

        // Convierte listas Markdown a una numeracion/viñeta limpia y elimina marcadores de formato.
        limpio = limpio.replaceAll("(?m)^\\s*[-+]\\s+", "• " );
        limpio = limpio.replaceAll("(?m)^\\s*\\*\\s+", "• " );
        limpio = limpio.replace("**", "");
        limpio = limpio.replace("__", "");
        limpio = limpio.replace("*", "");
        limpio = limpio.replace("`", "");

        // Evita espacios excesivos sin eliminar los saltos de linea utiles.
        limpio = limpio.replaceAll("[ \t]+(?=\n)", "");
        limpio = limpio.replaceAll("\n{3,}", "\n\n");

        return limpio.trim();
    }

    private String convertirContextoAJson(Object contexto) {
        try {
            return objectMapper.writeValueAsString(contexto);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("No fue posible preparar el contexto para Gemini");
        }
    }
}
