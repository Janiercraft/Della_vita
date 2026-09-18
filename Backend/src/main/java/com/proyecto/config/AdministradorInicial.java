package com.proyecto.config;

import com.proyecto.dto.UsuarioDto;
import com.proyecto.repository.UsuarioRepository;
import com.proyecto.service.UsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdministradorInicial implements ApplicationRunner {
    private final UsuarioRepository repository;
    private final UsuarioService servicio;

    @Value("${application.admin.usuario}")
    private String nombreUsuario;

    @Value("${application.admin.clave}")
    private String clave;

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        if (clave == null || clave.length() < 12 || clave.startsWith("CAMBIAR")) {
            throw new IllegalStateException(
                    "Defina ADMIN_PASSWORD con una clave propia de al menos 12 caracteres para el"
                            + " primer arranque");
        }
        servicio.guardar(
                UsuarioDto.builder()
                        .nombreUsuario(nombreUsuario)
                        .nombreCompleto("Administrador inicial")
                        .clave(clave)
                        .rol("ADMIN")
                        .build());
    }
}
