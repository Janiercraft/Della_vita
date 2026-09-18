package com.proyecto.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.RespuestaDto;
import com.proyecto.security.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.*;

@Configuration
@EnableMethodSecurity
public class SeguridadConfig {
    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception { return c.getAuthenticationManager(); }
    @Bean public FiltroJwt filtroJwt(JwtService jwtService, UsuarioAutenticacionService usuarios) { return new FiltroJwt(jwtService, usuarios); }

    @Bean
    public SecurityFilterChain seguridad(HttpSecurity http, ObjectMapper mapper, FiltroJwt filtroJwt) throws Exception {
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> {});
        http.authorizeHttpRequests(reglas -> reglas
                .requestMatchers("/actuator/health", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api/v1/auth/login").permitAll()
                .anyRequest().authenticated());
        http.exceptionHandling(ex -> ex
                .authenticationEntryPoint((request,response,error) -> {
                    response.setStatus(401); response.setContentType("application/json;charset=UTF-8");
                    mapper.writeValue(response.getOutputStream(), RespuestaDto.correcta("Token JWT ausente, invalido o expirado", null));
                })
                .accessDeniedHandler((request,response,error) -> {
                    response.setStatus(403); response.setContentType("application/json;charset=UTF-8");
                    mapper.writeValue(response.getOutputStream(), RespuestaDto.correcta("No tiene permiso para esta operacion", null));
                }));
        http.addFilterBefore(new FiltroTrazabilidad(), UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(new FiltroSolicitudApi(mapper), FiltroJwt.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${application.cors.origenes}") String origenes) {
        CorsConfiguration c = new CorsConfiguration();
        if ("*".equals(origenes.trim())) c.setAllowedOriginPatterns(List.of("*")); else c.setAllowedOrigins(Arrays.asList(origenes.split(",")));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization","Content-Type","Idempotency-Key","X-Requested-With"));
        c.setExposedHeaders(List.of("X-Request-Id","Content-Disposition"));
        c.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**", c); return source;
    }
}
