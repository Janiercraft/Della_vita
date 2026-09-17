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
    public UserDetails loadUserByUsername(String nombreUsuario) {
        Usuario usuario =
                repository
                        .findByNombreUsuario(nombreUsuario)
                        .orElseThrow(() -> new UsernameNotFoundException("Credenciales invalidas"));
        return User.withUsername(usuario.getNombreUsuario())
                .password(usuario.getClave())
                .roles(usuario.getRol())
                .disabled(!usuario.getActivo())
                .build();
    }
}
