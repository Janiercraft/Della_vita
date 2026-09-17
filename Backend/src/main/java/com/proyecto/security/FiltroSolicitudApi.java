package com.proyecto.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.RespuestaDto;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import lombok.RequiredArgsConstructor;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@RequiredArgsConstructor
public class FiltroSolicitudApi extends OncePerRequestFilter {
    private final ObjectMapper mapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain cadena)
            throws ServletException, IOException {
        if (!Set.of("GET", "HEAD", "OPTIONS").contains(request.getMethod())
                && !"gestion-beneficiarios".equals(request.getHeader("X-Requested-With"))) {
            response.setStatus(403);
            response.setContentType("application/json;charset=UTF-8");
            mapper.writeValue(
                    response.getOutputStream(),
                    RespuestaDto.correcta(
                            "Falta encabezado X-Requested-With: gestion-beneficiarios", null));
            return;
        }
        cadena.doFilter(request, response);
    }
}
