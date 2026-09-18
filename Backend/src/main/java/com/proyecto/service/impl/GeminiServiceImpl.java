package com.proyecto.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.exception.ProveedorIaException;
import com.proyecto.service.GeminiService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiServiceImpl implements GeminiService {
    private static final String PROVEEDOR = "GEMINI";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelo;

    public GeminiServiceImpl(
            ObjectMapper objectMapper,
            @Value("${application.gemini.url:https://generativelanguage.googleapis.com}") String url,
            @Value("${application.gemini.api-key:}") String apiKey,
            @Value("${application.gemini.modelo:gemini-3.6-flash}") String modelo,
            @Value("${application.gemini.timeout-conexion-ms:5000}") int timeoutConexionMs,
            @Value("${application.gemini.timeout-lectura-ms:15000}") int timeoutLecturaMs) {
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(timeoutConexionMs);
        fabrica.setReadTimeout(timeoutLecturaMs);

        this.restClient =
                RestClient.builder().baseUrl(url).requestFactory(fabrica).build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.modelo = modelo;
    }

    @Override
    public boolean estaConfigurado() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public String generarRespuesta(String instrucciones, String pregunta, Object contexto) {
        if (!estaConfigurado()) {
            throw ProveedorIaException.noConfigurado(PROVEEDOR);
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
                throw ProveedorIaException.respuestaInvalida(
                        PROVEEDOR, "Gemini respondio sin contenido");
            }

            JsonNode textoRespuesta = respuesta.at("/candidates/0/content/parts/0/text");
            if (textoRespuesta.isMissingNode() || textoRespuesta.asText().isBlank()) {
                throw ProveedorIaException.respuestaInvalida(
                        PROVEEDOR, "Gemini no genero una respuesta util");
            }
            return textoRespuesta.asText();
        } catch (ProveedorIaException error) {
            throw error;
        } catch (RestClientResponseException error) {
            int estado = error.getStatusCode().value();
            log.warn(
                    "Gemini rechazo la consulta, estadoHttp={}, modelo={}",
                    estado,
                    modelo);
            throw ProveedorIaException.http(
                    PROVEEDOR,
                    estado,
                    "Gemini no pudo procesar la consulta",
                    error);
        } catch (ResourceAccessException error) {
            log.warn("Gemini no respondio dentro del tiempo esperado o fallo la conexion");
            throw ProveedorIaException.conexion(
                    PROVEEDOR, "No fue posible conectar con Gemini", error);
        } catch (Exception error) {
            log.warn(
                    "Fallo inesperado consultando Gemini, tipo={}",
                    error.getClass().getSimpleName());
            throw ProveedorIaException.conexion(
                    PROVEEDOR, "Fallo inesperado consultando Gemini", error);
        }
    }

    private String convertirContextoAJson(Object contexto) {
        try {
            return objectMapper.writeValueAsString(contexto);
        } catch (JsonProcessingException error) {
            throw ProveedorIaException.respuestaInvalida(
                    PROVEEDOR, "No fue posible preparar el contexto autorizado");
        }
    }
}
