package com.proyecto.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final SecretKey clave;
    private final long expiracionMs;

    public JwtService(
            @Value("${JWT_SECRET:gestion-beneficiarios-jwt-clave-local-cambiar-en-produccion-2026}") String secreto,
            @Value("${JWT_EXPIRATION_MS:28800000}") long expiracionMs) {
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 bytes");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    public String generar(UserDetails usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claims(Map.of("authorities", usuario.getAuthorities().stream().map(Object::toString).toList()))
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(expiracionMs)))
                .signWith(clave)
                .compact();
    }

    public String extraerUsuario(String token) {
        return claims(token).getSubject();
    }

    public boolean esValido(String token, UserDetails usuario) {
        try {
            Claims claims = claims(token);
            return usuario.getUsername().equals(claims.getSubject())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date())
                    && usuario.isEnabled()
                    && usuario.isAccountNonLocked()
                    && usuario.isAccountNonExpired()
                    && usuario.isCredentialsNonExpired();
        } catch (Exception error) {
            return false;
        }
    }

    public long getExpiracionMs() {
        return expiracionMs;
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }
}
