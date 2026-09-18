package com.proyecto.service.impl;

import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.Beneficiario;
import com.proyecto.model.Participacion;
import com.proyecto.model.Usuario;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.repository.ParticipacionRepository;
import com.proyecto.repository.UsuarioRepository;
import com.proyecto.service.ControlAccesoService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ControlAccesoServiceImpl implements ControlAccesoService {
    private final UsuarioRepository usuarioRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ParticipacionRepository participacionRepository;

    @Override
    public Usuario usuarioActual() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null || autenticacion.getName() == null
                || "anonymousUser".equals(autenticacion.getName())) {
            return Usuario.builder()
                    .nombreUsuario("sistema")
                    .nombreCompleto("Proceso interno")
                    .rol("ADMIN")
                    .build();
        }
        if (autenticacion.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            return usuarioRepository
                    .findByNombreUsuario(autenticacion.getName())
                    .orElseGet(
                            () -> Usuario.builder()
                                    .nombreUsuario(autenticacion.getName())
                                    .nombreCompleto("Administrador autenticado")
                                    .rol("ADMIN")
                                    .build());
        }
        return usuarioRepository
                .findByNombreUsuario(autenticacion.getName())
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Usuario autenticado"));
    }

    @Override
    public boolean esAdmin() {
        return "ADMIN".equals(usuarioActual().getRol());
    }

    @Override
    public boolean esOperador() {
        return "OPERADOR".equals(usuarioActual().getRol());
    }

    @Override
    public String municipioAsignado() {
        return usuarioActual().getMunicipioAsignado();
    }

    @Override
    public void validarMunicipio(String municipio) {
        Usuario usuario = usuarioActual();
        if (!"OPERADOR".equals(usuario.getRol())) {
            return;
        }
        if (usuario.getMunicipioAsignado() == null || usuario.getMunicipioAsignado().isBlank()) {
            throw new ExcepcionNegocio(
                    HttpStatus.FORBIDDEN,
                    "El funcionario no tiene municipio asignado; solicite configuracion al coordinador");
        }
        if (municipio == null || !usuario.getMunicipioAsignado().equalsIgnoreCase(municipio.trim())) {
            throw new ExcepcionNegocio(
                    HttpStatus.FORBIDDEN,
                    "El funcionario solo puede operar registros del municipio "
                            + usuario.getMunicipioAsignado());
        }
    }

    @Override
    public void validarBeneficiario(Long idBeneficiario) {
        Beneficiario beneficiario = beneficiarioRepository
                .findById(idBeneficiario)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
        validarMunicipio(beneficiario.getMunicipio());
    }

    @Override
    public void validarParticipacion(Long idParticipacion) {
        Participacion participacion = participacionRepository
                .findById(idParticipacion)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Participacion"));
        validarBeneficiario(participacion.getIdBeneficiario());
    }
}
