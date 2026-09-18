package com.proyecto.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.exception.ProveedorIaException;
import com.proyecto.service.DeepSeekService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
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
public class DeepSeekServiceImpl implements DeepSeekService {
    private static final String PROVEEDOR = "DEEPSEEK";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelo;

    public DeepSeekServiceImpl(
            ObjectMapper objectMapper,
            @Value("${application.deepseek.url:https://api.deepseek.com}") String url,
            @Value("${application.deepseek.api-key:}") String apiKey,
            @Value("${application.deepseek.modelo:deepseek-flash}") String modelo,
            @Value("${application.deepseek.timeout-conexion-ms:5000}") int timeoutConexionMs,
            @Value("${application.deepseek.timeout-lectura-ms:15000}") int timeoutLecturaMs) {
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

        log.info("Enviando consulta segura a DeepSeek, modelo={}", modelo);

        String contextoJson = convertirContextoAJson(contexto);
        String mensajeUsuario =
                "PREGUNTA DEL USUARIO:\n"
                        + pregunta
                        + "\n\nCONTEXTO AUTORIZADO POR EL BACKEND (JSON):\n"
                        + contextoJson;

        Map<String, Object> cuerpo =
                Map.of(
                        "model",
                        modelo,
                        "messages",
                        List.of(
                                Map.of("role", "system", "content", instrucciones),
                                Map.of("role", "user", "content", mensajeUsuario)),
                        "thinking",
                        Map.of("type", "disabled"),
                        "temperature",
                        0.2,
                        "max_tokens",
                        1200,
                        "stream",
                        false);

        try {
            JsonNode respuesta =
                    restClient
                            .post()
                            .uri("/chat/completions")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cuerpo)
                            .retrieve()
                            .body(JsonNode.class);

            if (respuesta == null) {
                throw ProveedorIaException.respuestaInvalida(
                        PROVEEDOR, "DeepSeek respondio sin contenido");
            }

            JsonNode textoRespuesta = respuesta.at("/choices/0/message/content");
            if (textoRespuesta.isMissingNode() || textoRespuesta.asText().isBlank()) {
                throw ProveedorIaException.respuestaInvalida(
                        PROVEEDOR, "DeepSeek no genero una respuesta util");
            }
            return textoRespuesta.asText();
        } catch (ProveedorIaException error) {
            throw error;
        } catch (RestClientResponseException error) {
            int estado = error.getStatusCode().value();
            log.warn(
                    "DeepSeek rechazo la consulta, estadoHttp={}, modelo={}",
                    estado,
                    modelo);
            throw ProveedorIaException.http(
                    PROVEEDOR,
                    estado,
                    "DeepSeek no pudo procesar la consulta",
                    error);
        } catch (ResourceAccessException error) {
            log.warn("DeepSeek no respondio dentro del tiempo esperado o fallo la conexion");
            throw ProveedorIaException.conexion(
                    PROVEEDOR, "No fue posible conectar con DeepSeek", error);
        } catch (Exception error) {
            log.warn(
                    "Fallo inesperado consultando DeepSeek, tipo={}",
                    error.getClass().getSimpleName());
            throw ProveedorIaException.conexion(
                    PROVEEDOR, "Fallo inesperado consultando DeepSeek", error);
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
