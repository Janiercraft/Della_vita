package com.proyecto.repository;

import com.proyecto.model.Usuario;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.rol = 'ADMIN' and u.activo = true order by u.id")
    java.util.List<Usuario> bloquearAdministradores();
}
