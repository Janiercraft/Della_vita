package com.proyecto.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FiltroJwt extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UsuarioAutenticacionService usuarios;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String autorizacion = request.getHeader("Authorization");
        if (autorizacion == null || !autorizacion.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = autorizacion.substring(7).trim();
        if (!token.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String nombreUsuario = jwtService.extraerUsuario(token);
                UserDetails usuario = usuarios.loadUserByUsername(nombreUsuario);
                if (jwtService.esValido(token, usuario)) {
                    UsernamePasswordAuthenticationToken autenticacion =
                            new UsernamePasswordAuthenticationToken(
                                    usuario, null, usuario.getAuthorities());
                    autenticacion.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(autenticacion);
                }
            } catch (Exception ignored) {
                // El entry point de Spring Security respondera 401 si el recurso exige autenticacion.
            }
        }
        filterChain.doFilter(request, response);
    }
}
