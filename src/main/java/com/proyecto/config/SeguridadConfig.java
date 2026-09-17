package com.proyecto.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.RespuestaDto;
import com.proyecto.security.FiltroTrazabilidad;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.*;

@Configuration
@EnableMethodSecurity
public class SeguridadConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain seguridad(HttpSecurity http, ObjectMapper mapper) throws Exception {
        http.sessionManagement(
                sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        // API sin cookies: exige un encabezado adicional en mutaciones para impedir CSRF con Basic
        // del navegador.
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> {});
        http.authorizeHttpRequests(
                reglas ->
                        reglas.requestMatchers(
                                        "/actuator/health",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/v3/api-docs/**")
                                .permitAll()
                                .anyRequest()
                                .authenticated());
        http.httpBasic(
                basic ->
                        basic.authenticationEntryPoint(
                                (request, response, error) -> {
                                    response.setStatus(401);
                                    response.setContentType("application/json;charset=UTF-8");
                                    mapper.writeValue(
                                            response.getOutputStream(),
                                            RespuestaDto.correcta(
                                                    "Credenciales invalidas o ausentes", null));
                                }));
        http.exceptionHandling(
                ex ->
                        ex.accessDeniedHandler(
                                (request, response, error) -> {
                                    response.setStatus(403);
                                    response.setContentType("application/json;charset=UTF-8");
                                    mapper.writeValue(
                                            response.getOutputStream(),
                                            RespuestaDto.correcta(
                                                    "No tiene permiso para esta operacion", null));
                                }));
        http.addFilterBefore(new FiltroTrazabilidad(), BasicAuthenticationFilter.class);
        http.addFilterAfter(
                new com.proyecto.security.FiltroSolicitudApi(mapper),
                BasicAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${application.cors.origenes}") String origenes) {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(Arrays.asList(origenes.split(",")));
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "OPTIONS"));
        configuracion.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Idempotency-Key", "X-Requested-With"));
        configuracion.setExposedHeaders(List.of("X-Request-Id", "Content-Disposition"));
        configuracion.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource origen = new UrlBasedCorsConfigurationSource();
        origen.registerCorsConfiguration("/**", configuracion);
        return origen;
    }
}
