package com.proyecto.repository;

import com.proyecto.model.Usuario;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    Optional<Usuario> findByNombreUsuarioIgnoreCase(String nombreUsuario);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    @Query("select u from Usuario u where lower(u.nombreUsuario) = lower(:identificador) or lower(u.correo) = lower(:identificador)")
    Optional<Usuario> buscarPorIdentificador(@Param("identificador") String identificador);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.rol = 'ADMIN' and u.activo = true order by u.id")
    java.util.List<Usuario> bloquearAdministradores();
}
