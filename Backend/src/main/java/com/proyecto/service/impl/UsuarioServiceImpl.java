package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.Usuario;
import com.proyecto.repository.UsuarioRepository;
import com.proyecto.service.*;
import com.proyecto.util.Paginacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public UsuarioDto guardar(UsuarioDto dto) {
        if (dto.getClave() == null) {
            throw ExcepcionNegocio.invalido("Falta clave");
        }
        validarNombre(dto.getNombreUsuario(), null);
        Usuario usuario = new Usuario();
        copiar(dto, usuario);
        repository.saveAndFlush(usuario);
        auditoriaService.registrar(
                "Usuario", usuario.getId(), "CREAR", null, convertir(usuario), "Usuario creado");
        log.info("Usuario creado, id={}", usuario.getId());
        return convertir(usuario);
    }

    @Override
    @Transactional
    public UsuarioDto editar(Long id, UsuarioDto dto) {
        // Serializa los cambios que podrian dejar al sistema sin administrador.
        List<Usuario> administradores = repository.bloquearAdministradores();
        Usuario usuario = obtener(id);
        version(usuario, dto.getVersion());
        if (usuario.getActivo()
                && usuario.getRol().equals("ADMIN")
                && !dto.getRol().equals("ADMIN")
                && administradores.size() <= 1) {
            throw ExcepcionNegocio.conflicto("Debe conservar al menos un administrador activo");
        }
        validarNombre(dto.getNombreUsuario(), id);
        UsuarioDto anterior = convertir(usuario);
        copiar(dto, usuario);
        repository.saveAndFlush(usuario);
        auditoriaService.registrar(
                "Usuario", id, "EDITAR", anterior, convertir(usuario), "Usuario actualizado");
        return convertir(usuario);
    }

    @Override
    @Transactional
    public UsuarioDto cambiarEstado(Long id, EstadoDto dto) {
        List<Usuario> administradores = repository.bloquearAdministradores();
        Usuario usuario = obtener(id);
        version(usuario, dto.getVersion());
        if (!dto.getActivo()
                && usuario.getActivo()
                && usuario.getRol().equals("ADMIN")
                && administradores.size() <= 1) {
            throw ExcepcionNegocio.conflicto("No puede desactivar al ultimo administrador");
        }
        UsuarioDto anterior = convertir(usuario);
        usuario.setActivo(dto.getActivo());
        repository.saveAndFlush(usuario);
        auditoriaService.registrar(
                "Usuario", id, "CAMBIAR_ESTADO", anterior, convertir(usuario), dto.getMotivo());
        return convertir(usuario);
    }

    @Override
    public UsuarioDto consultar(Long id) {
        return convertir(obtener(id));
    }

    @Override
    public Page<UsuarioDto> listar(int pagina, int tamanio) {
        return repository.findAll(Paginacion.crear(pagina, tamanio)).map(this::convertir);
    }

    private Usuario obtener(Long id) {
        Optional<Usuario> usuario = repository.findById(id);
        if (usuario.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Usuario");
        }
        return usuario.get();
    }

    private void version(Usuario usuario, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version");
        }
        if (!version.equals(usuario.getVersion())) {
            throw ExcepcionNegocio.conflicto("El usuario fue modificado; consulte nuevamente");
        }
    }

    private void validarNombre(String nombre, Long id) {
        Optional<Usuario> existente = repository.findByNombreUsuario(nombre);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw ExcepcionNegocio.conflicto("El nombre de usuario ya existe");
        }
    }

    private void copiar(UsuarioDto dto, Usuario usuario) {
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setRol(dto.getRol());
        if (dto.getClave() != null) {
            if (dto.getClave().isBlank()
                    || dto.getClave().length() < 12
                    || dto.getClave().getBytes(StandardCharsets.UTF_8).length > 72) {
                throw ExcepcionNegocio.invalido(
                        "La clave debe tener al menos 12 caracteres y como maximo 72 bytes UTF-8");
            }
            usuario.setClave(passwordEncoder.encode(dto.getClave()));
        }
    }

    private UsuarioDto convertir(Usuario usuario) {
        return UsuarioDto.builder()
                .id(usuario.getId())
                .version(usuario.getVersion())
                .activo(usuario.getActivo())
                .nombreUsuario(usuario.getNombreUsuario())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol())
                .build();
    }
}
