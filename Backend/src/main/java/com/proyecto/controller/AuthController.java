package com.proyecto.controller;

import com.proyecto.dto.LoginDto;
import com.proyecto.dto.RespuestaDto;
import com.proyecto.dto.UsuarioDto;
import com.proyecto.model.Usuario;
import com.proyecto.repository.UsuarioRepository;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.ControlAccesoService;
import com.proyecto.service.UsuarioService;
import com.proyecto.service.BeneficiarioService;
import com.proyecto.security.JwtService;
import com.proyecto.security.UsuarioAutenticacionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${application.api.path}/auth")
public class AuthController {
    private final ControlAccesoService controlAcceso;
    private final UsuarioService usuarioService;
    private final BeneficiarioService beneficiarioService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final JwtService jwtService;
    private final UsuarioAutenticacionService usuarioAutenticacionService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto dto) {
        try {
            Authentication autenticacion =
                    authenticationManager.authenticate(
                            UsernamePasswordAuthenticationToken.unauthenticated(
                                    dto.getIdentificador().trim(), dto.getClave()));

            Usuario usuario = usuarioRepository.findByNombreUsuario(autenticacion.getName())
                    .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));
            if ("CONSULTA".equals(usuario.getRol())) {
                if (usuario.getIdBeneficiario() == null) {
                    return ResponseEntity.status(403)
                            .body(RespuestaDto.correcta(
                                    "Tu cuenta no esta vinculada a un beneficiario registrado en la plataforma. Contacta al coordinador.", null));
                }
                var beneficiario = beneficiarioRepository.findById(usuario.getIdBeneficiario()).orElse(null);
                if (beneficiario == null) {
                    return ResponseEntity.status(403)
                            .body(RespuestaDto.correcta(
                                    "El beneficiario asociado a tu cuenta no existe en la plataforma. Contacta al coordinador.", null));
                }
                if (!Boolean.TRUE.equals(beneficiario.getActivo())) {
                    return ResponseEntity.status(403)
                            .body(RespuestaDto.correcta(
                                    "El beneficiario asociado a tu cuenta esta inactivo. Contacta al coordinador para revisar el acceso.", null));
                }
            }
            UsuarioDto perfil = usuarioService.consultar(usuario.getId());
            String token = jwtService.generar(
                    usuarioAutenticacionService.loadUserByUsername(usuario.getNombreUsuario()));
            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + token)
                    .header("X-Auth-Token", token)
                    .body(RespuestaDto.correcta("Acceso autorizado", perfil));
        } catch (DisabledException error) {
            return ResponseEntity.status(403)
                    .body(
                            RespuestaDto.correcta(
                                    "Tu cuenta esta inactiva. Contacta al coordinador para habilitar el acceso.",
                                    null));
        } catch (LockedException error) {
            return ResponseEntity.status(403)
                    .body(
                            RespuestaDto.correcta(
                                    "Tu cuenta esta bloqueada. Contacta al coordinador.", null));
        } catch (BadCredentialsException error) {
            return ResponseEntity.status(401)
                    .body(
                            RespuestaDto.correcta(
                                    "Usuario/correo o contraseña incorrectos.", null));
        } catch (AuthenticationException error) {
            return ResponseEntity.status(401)
                    .body(RespuestaDto.correcta("No fue posible iniciar sesion con esas credenciales.", null));
        }
    }


    @GetMapping("/mi-beneficiario")
    public RespuestaDto<?> miBeneficiario() {
        Usuario actual = controlAcceso.usuarioActual();
        if (!"CONSULTA".equals(actual.getRol())) {
            return RespuestaDto.correcta("El usuario autenticado no corresponde a un beneficiario", null);
        }
        if (actual.getIdBeneficiario() == null) {
            return RespuestaDto.correcta("Tu cuenta no esta vinculada a un beneficiario registrado en la plataforma", null);
        }
        return RespuestaDto.correcta(
                "Beneficiario asociado consultado correctamente",
                beneficiarioService.consultar(actual.getIdBeneficiario()));
    }

    @GetMapping("/me")
    public RespuestaDto<?> yo() {
        Usuario actual = controlAcceso.usuarioActual();
        UsuarioDto dto = usuarioService.consultar(actual.getId());
        return RespuestaDto.correcta("Sesion activa", dto);
    }
}
