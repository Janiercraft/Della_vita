package com.proyecto.security;

import com.proyecto.model.Usuario;
import com.proyecto.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioAutenticacionService implements UserDetailsService {
    private final UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String identificador) {
        Usuario usuario = repository
                .buscarPorIdentificador(identificador == null ? "" : identificador.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales invalidas"));

        return User.withUsername(usuario.getNombreUsuario())
                .password(usuario.getClave())
                .roles(usuario.getRol())
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
    }
}
