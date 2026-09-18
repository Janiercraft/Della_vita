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
            return textoRespuesta.asText().trim();
        } catch (ExcepcionNegocio error) {
            throw error;
        } catch (Exception error) {
            log.warn("No fue posible completar la consulta con Gemini, tipo={}", error.getClass().getSimpleName());
            throw new IllegalStateException("No fue posible consultar el asistente IA en este momento");
        }
    }

    private String convertirContextoAJson(Object contexto) {
        try {
            return objectMapper.writeValueAsString(contexto);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("No fue posible preparar el contexto para Gemini");
        }
    }
}
