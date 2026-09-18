package com.proyecto.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.dto.RespuestaDto;
import com.proyecto.model.Usuario;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.repository.UsuarioRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class FiltroBeneficiarioActivo extends OncePerRequestFilter {
    private final ObjectMapper mapper;
    private final UsuarioRepository usuarioRepository;
    private final BeneficiarioRepository beneficiarioRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            chain.doFilter(request, response);
            return;
        }

        boolean esBeneficiario = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_CONSULTA".equals(a.getAuthority()));
        if (!esBeneficiario) {
            chain.doFilter(request, response);
            return;
        }

        Usuario usuario = usuarioRepository.findByNombreUsuario(auth.getName()).orElse(null);
        String mensaje = null;
        if (usuario == null || usuario.getIdBeneficiario() == null) {
            mensaje = "Tu cuenta no esta vinculada a un beneficiario registrado en la plataforma. Contacta al coordinador.";
        } else {
            var beneficiario = beneficiarioRepository.findById(usuario.getIdBeneficiario()).orElse(null);
            if (beneficiario == null) {
                mensaje = "El beneficiario asociado a tu cuenta no existe en la plataforma. Contacta al coordinador.";
            } else if (!Boolean.TRUE.equals(beneficiario.getActivo())) {
                mensaje = "El beneficiario asociado a tu cuenta esta inactivo. Contacta al coordinador para revisar el acceso.";
            }
        }

        if (mensaje != null) {
            response.setStatus(403);
            response.setContentType("application/json;charset=UTF-8");
            mapper.writeValue(response.getOutputStream(), RespuestaDto.correcta(mensaje, null));
            return;
        }
        chain.doFilter(request, response);
    }
}
