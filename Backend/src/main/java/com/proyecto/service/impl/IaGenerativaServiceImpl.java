package com.proyecto.service.impl;

import com.proyecto.dto.ResultadoGeneracionIa;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.exception.ProveedorIaException;
import com.proyecto.service.DeepSeekService;
import com.proyecto.service.GeminiService;
import com.proyecto.service.IaGenerativaService;
import com.proyecto.util.FormatoRespuestaIa;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class IaGenerativaServiceImpl implements IaGenerativaService {
    private final GeminiService geminiService;
    private final DeepSeekService deepSeekService;

    @Value("${application.ia.reintentos-gemini:0}")
    private int reintentosGemini;

    @Value("${application.ia.reintentos-deepseek:1}")
    private int reintentosDeepSeek;

    @Value("${application.ia.espera-reintento-ms:700}")
    private long esperaReintentoMs;

    @Override
    public ResultadoGeneracionIa generarRespuesta(
            String instrucciones, String pregunta, Object contexto) {
        ProveedorIaException errorGemini = null;

        if (geminiService.estaConfigurado()) {
            try {
                String respuesta =
                        ejecutarConReintentos(
                                "GEMINI",
                                reintentosGemini,
                                () -> geminiService.generarRespuesta(instrucciones, pregunta, contexto));
                return resultado(respuesta, "GEMINI");
            } catch (ProveedorIaException error) {
                errorGemini = error;
                log.warn(
                        "Gemini no completo la consulta; se intentara fallback con DeepSeek. estadoHttp={}, reintentable={}",
                        error.getEstadoHttp(),
                        error.isReintentable());
            }
        } else {
            log.warn("Gemini no esta configurado; se intentara DeepSeek directamente");
        }

        if (deepSeekService.estaConfigurado()) {
            try {
                String respuesta =
                        ejecutarConReintentos(
                                "DEEPSEEK",
                                reintentosDeepSeek,
                                () -> deepSeekService.generarRespuesta(instrucciones, pregunta, contexto));
                log.info("Consulta IA resuelta por proveedor fallback DeepSeek");
                return resultado(respuesta, "DEEPSEEK");
            } catch (ProveedorIaException errorDeepSeek) {
                log.warn(
                        "DeepSeek tampoco pudo completar la consulta. estadoHttp={}, reintentable={}",
                        errorDeepSeek.getEstadoHttp(),
                        errorDeepSeek.isReintentable());
                throw ExcepcionNegocio.servicioNoDisponible(
                        "El asistente IA no esta disponible temporalmente. Intente nuevamente en unos segundos");
            }
        }

        if (errorGemini != null) {
            throw ExcepcionNegocio.servicioNoDisponible(
                    "El asistente IA no esta disponible temporalmente. Intente nuevamente en unos segundos");
        }

        throw ExcepcionNegocio.servicioNoDisponible(
                "El asistente IA no tiene proveedores configurados. Configure GEMINI_API_KEY o DEEPSEEK_API_KEY");
    }

    private String ejecutarConReintentos(
            String proveedor, int reintentosAdicionales, OperacionProveedor operacion) {
        int reintentos = Math.max(0, Math.min(reintentosAdicionales, 3));
        ProveedorIaException ultimoError = null;

        for (int intento = 0; intento <= reintentos; intento++) {
            try {
                return operacion.ejecutar();
            } catch (ProveedorIaException error) {
                ultimoError = error;
                boolean puedeReintentar = error.isReintentable() && intento < reintentos;
                if (!puedeReintentar) {
                    throw error;
                }

                log.info(
                        "Reintentando proveedor IA={}, intento={} de {}",
                        proveedor,
                        intento + 2,
                        reintentos + 1);
                esperarAntesDeReintentar();
            }
        }

        throw ultimoError;
    }

    private void esperarAntesDeReintentar() {
        try {
            Thread.sleep(Math.max(0, Math.min(esperaReintentoMs, 3000)));
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw ProveedorIaException.conexion(
                    "IA", "La consulta al proveedor IA fue interrumpida", error);
        }
    }

    private ResultadoGeneracionIa resultado(String respuesta, String proveedor) {
        String textoPlano = FormatoRespuestaIa.textoPlano(respuesta);
        if (textoPlano.isBlank()) {
            throw ProveedorIaException.respuestaInvalida(
                    proveedor, "El proveedor IA no genero texto util");
        }
        return new ResultadoGeneracionIa(textoPlano, proveedor);
    }

    @FunctionalInterface
    private interface OperacionProveedor {
        String ejecutar();
    }
}
