package com.proyecto.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import lombok.extern.slf4j.Slf4j;

import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
public class FiltroTrazabilidad extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain cadena)
            throws ServletException, IOException {
        String solicitudId = UUID.randomUUID().toString();
        MDC.put("solicitudId", solicitudId);
        response.setHeader("X-Request-Id", solicitudId);
        long inicio = System.currentTimeMillis();
        try {
            cadena.doFilter(request, response);
        } finally {
            log.info(
                    "Peticion metodo={} estado={} duracionMs={}",
                    request.getMethod(),
                    response.getStatus(),
                    System.currentTimeMillis() - inicio);
            MDC.remove("solicitudId");
        }
    }
}
