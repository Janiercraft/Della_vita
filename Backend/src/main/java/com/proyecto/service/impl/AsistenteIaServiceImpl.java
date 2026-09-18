package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.Beneficiario;
import com.proyecto.model.Usuario;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.repository.UsuarioRepository;
import com.proyecto.service.*;
import com.proyecto.util.Normalizador;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsistenteIaServiceImpl implements AsistenteIaService {
    private final GeminiService geminiService;
    private final FiltroDatosIaService filtroDatosIaService;
    private final BeneficiarioRepository beneficiarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    private static final String INSTRUCCIONES_COMUNES =
            "Eres el asistente del proyecto URABA-PAIS. "
                    + "Responde en espanol claro, breve y profesional. "
                    + "Usa exclusivamente el contexto autorizado entregado por el backend. "
                    + "No inventes datos ni cantidades. Si el contexto no permite responder, indicalo. "
                    + "No emitas diagnosticos medicos, psicologicos o juridicos. "
                    + "No decidas quien debe recibir una ayuda o servicio. "
                    + "Tus respuestas son apoyo para consulta y seguimiento, no decisiones institucionales.";

    @Override
    public RespuestaIaDto preguntar(ConsultaIaDto dto) {
        String rol = rolActual();
        log.info("Procesando consulta del asistente IA, rol={}", rol);

        return switch (rol) {
            case "ADMIN" -> preguntarComoAdmin(dto);
            case "OPERADOR" -> responderFuncionario(dto.getPregunta());
            case "CONSULTA" -> responderUsuarioFinal(dto);
            default -> throw new AccessDeniedException("El rol autenticado no tiene acceso al asistente IA");
        };
    }

    @Override
    public RespuestaIaDto reporteBeneficiario(Long idBeneficiario, ConsultaIaDto dto) {
        exigirRol("ADMIN");
        return responderBeneficiarioAdmin(idBeneficiario, dto.getPregunta());
    }

    @Override
    public RespuestaIaDto miInformacion(ConsultaIaDto dto) {
        exigirRol("CONSULTA");
        return responderUsuarioFinal(dto);
    }

    @Override
    public RespuestaIaDto consultaFuncionario(ConsultaIaDto dto) {
        exigirRol("OPERADOR");
        return responderFuncionario(dto.getPregunta());
    }

    @Override
    public RespuestaIaDto resumenEjecutivo() {
        exigirRol("ADMIN");

        ResumenIaDto resumen = filtroDatosIaService.prepararResumenSeguro();
        String instrucciones =
                INSTRUCCIONES_COMUNES
                        + " El usuario autenticado es ADMIN/coordinador. "
                        + "Genera un resumen ejecutivo usando solamente estadisticas agregadas. "
                        + "No menciones datos personales porque este contexto no los contiene.";

        String respuesta =
                geminiService.generarRespuesta(
                        instrucciones,
                        "Genera un resumen ejecutivo del estado actual del proyecto.",
                        resumen);

        registrarAuditoria(0L, "RESUMEN_EJECUTIVO_ADMIN", "ADMIN");
        return construirRespuesta(respuesta, "RESUMEN_EJECUTIVO", "ADMIN", null);
    }

    @Override
    public List<String> sugerencias() {
        String rol = rolActual();

        if ("ADMIN".equals(rol)) {
            return List.of(
                    "Genera un resumen ejecutivo del proyecto",
                    "Cuantos beneficiarios hay por municipio?",
                    "Cuantos seguimientos estan pendientes?",
                    "Dame un reporte de Pepito Perez",
                    "Que funcionario realizo las atenciones de este beneficiario?");
        }

        if ("OPERADOR".equals(rol)) {
            return List.of(
                    "Cuantas atenciones he registrado?",
                    "Que atenciones realice recientemente?",
                    "A quienes he atendido?",
                    "Que seguimientos he registrado?",
                    "Cuales de mis seguimientos tienen proxima fecha?");
        }

        return List.of(
                "Que atenciones o ayudas he recibido?",
                "En que programas estoy vinculado?",
                "Cual es mi proximo seguimiento?",
                "Como va mi proceso?",
                "Que seguimientos tengo registrados?");
    }

    private RespuestaIaDto preguntarComoAdmin(ConsultaIaDto dto) {
        Long idBeneficiario = dto.getIdBeneficiario();
        if (idBeneficiario == null) {
            idBeneficiario = buscarBeneficiarioMencionado(dto.getPregunta());
        }

        if (idBeneficiario != null) {
            return responderBeneficiarioAdmin(idBeneficiario, dto.getPregunta());
        }

        return responderAgregadoAdmin(dto.getPregunta());
    }

    private RespuestaIaDto responderAgregadoAdmin(String pregunta) {
        ResumenIaDto resumen = filtroDatosIaService.prepararResumenSeguro();
        String instrucciones =
                INSTRUCCIONES_COMUNES
                        + " El usuario autenticado es ADMIN/coordinador. "
                        + "Esta consulta usa un contexto agregado. "
                        + "No inventes nombres, documentos, funcionarios ni detalles individuales si no aparecen en el contexto. "
                        + "Si la pregunta requiere un beneficiario concreto, indica que debe seleccionarlo o usar su idBeneficiario.";

        String respuesta = geminiService.generarRespuesta(instrucciones, pregunta, resumen);
        registrarAuditoria(0L, "CONSULTA_AGREGADA_ADMIN", "ADMIN");
        return construirRespuesta(respuesta, "AGREGADA_ADMIN", "ADMIN", null);
    }

    private RespuestaIaDto responderBeneficiarioAdmin(Long idBeneficiario, String pregunta) {
        BeneficiarioIaAdminDto contexto = filtroDatosIaService.prepararBeneficiarioAdmin(idBeneficiario);
        String instrucciones =
                INSTRUCCIONES_COMUNES
                        + " El usuario autenticado es ADMIN/coordinador y puede consultar el historial individual incluido en el contexto. "
                        + "Puede consultar nombre, programas, atenciones, seguimientos y que funcionario registro cada evento. "
                        + "Documento y celular ya fueron enmascarados por el backend: nunca intentes reconstruirlos ni pedir su valor completo. "
                        + "No reveles direccion exacta, credenciales, tokens ni informacion que no aparezca expresamente en el contexto.";

        String respuesta = geminiService.generarRespuesta(instrucciones, pregunta, contexto);
        registrarAuditoria(idBeneficiario, "CONSULTA_INDIVIDUAL_ADMIN", "ADMIN");
        return construirRespuesta(respuesta, "INDIVIDUAL_ADMIN", "ADMIN", idBeneficiario);
    }

    private RespuestaIaDto responderFuncionario(String pregunta) {
        String nombreUsuario = nombreUsuarioActual();
        FuncionarioIaDto contexto = filtroDatosIaService.prepararFuncionario(nombreUsuario);

        String instrucciones =
                INSTRUCCIONES_COMUNES
                        + " El usuario autenticado es FUNCIONARIO, representado tecnicamente por el rol OPERADOR. "
                        + "Solo puedes responder sobre las atenciones y seguimientos creados por este mismo funcionario y presentes en el contexto. "
                        + "El funcionario esta delimitado al municipio indicado en el contexto y no puede obtener informacion de otras sedes. "
                        + "No muestres KPIs macro, graficos consolidados, registros de otros funcionarios, historial completo de beneficiarios ni motivos por los que una persona es beneficiaria. "
                        + "Si resume actividad, limita el analisis a la actividad propia del funcionario. "
                        + "Los documentos ya estan enmascarados: no intentes reconstruirlos. "
                        + "Si pregunta por una persona que no aparece en sus propios registros, indica que no tiene informacion autorizada para responder.";

        String respuesta = geminiService.generarRespuesta(instrucciones, pregunta, contexto);
        registrarAuditoria(0L, "CONSULTA_FUNCIONARIO", "OPERADOR");
        return construirRespuesta(respuesta, "FUNCIONARIO", "OPERADOR", null);
    }

    private RespuestaIaDto responderUsuarioFinal(ConsultaIaDto dto) {
        Usuario usuario = obtenerUsuarioActual();
        Long idBeneficiario = usuario.getIdBeneficiario();

        if (idBeneficiario == null) {
            throw ExcepcionNegocio.conflicto(
                    "El usuario CONSULTA no esta vinculado a un beneficiario. Un ADMIN debe asignar idBeneficiario al usuario");
        }

        if (dto.getIdBeneficiario() != null && !dto.getIdBeneficiario().equals(idBeneficiario)) {
            throw new AccessDeniedException("Solo puede consultar su propia informacion");
        }

        BeneficiarioIaUsuarioDto contexto =
                filtroDatosIaService.prepararBeneficiarioUsuario(idBeneficiario);

        String instrucciones =
                INSTRUCCIONES_COMUNES
                        + " El usuario autenticado es el propio beneficiario. "
                        + "Solo puedes responder con su informacion personal autorizada presente en el contexto: programas, atenciones o ayudas recibidas y seguimientos. "
                        + "No reveles informacion de otras personas, estadisticas internas, datos de otros beneficiarios, observaciones internas ni el motivo por el que esta persona es beneficiaria. "
                        + "No muestres documentos, telefonos, direcciones ni informacion interna de funcionarios. "
                        + "Si pregunta por ayudas o actividades programadas cercanas, responde solamente si dicha informacion aparece en el contexto; de lo contrario indica que ese modulo aun no aporta datos al asistente.";

        String respuesta = geminiService.generarRespuesta(instrucciones, dto.getPregunta(), contexto);
        registrarAuditoria(idBeneficiario, "CONSULTA_PROPIA_USUARIO", "CONSULTA");
        return construirRespuesta(respuesta, "MI_INFORMACION", "CONSULTA", idBeneficiario);
    }

    private Long buscarBeneficiarioMencionado(String pregunta) {
        String nombre = extraerNombre(pregunta);
        if (nombre == null) {
            return null;
        }

        String nombreNormalizado = Normalizador.clave(nombre);
        if (nombreNormalizado.length() < 3) {
            return null;
        }

        List<Beneficiario> coincidencias =
                beneficiarioRepository.findTop10ByNombreNormalizadoContainingOrderById(nombreNormalizado);
        if (coincidencias.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario indicado en la pregunta");
        }

        for (Beneficiario beneficiario : coincidencias) {
            if (beneficiario.getNombreNormalizado().equals(nombreNormalizado)) {
                return beneficiario.getId();
            }
        }

        if (coincidencias.size() > 1) {
            throw ExcepcionNegocio.conflicto(
                    "Hay varias personas que coinciden con ese nombre; seleccione el beneficiario y envie idBeneficiario");
        }
        return coincidencias.getFirst().getId();
    }

    private String extraerNombre(String pregunta) {
        String texto = pregunta.trim();
        String textoMinuscula = texto.toLowerCase(Locale.ROOT);
        List<String> frases =
                List.of(
                        "reporte de ",
                        "historial de ",
                        "datos de ",
                        "informacion de ",
                        "información de ",
                        "seguimientos de ",
                        "atenciones de ");

        for (String frase : frases) {
            int posicion = textoMinuscula.indexOf(frase);
            if (posicion >= 0) {
                String nombre = texto.substring(posicion + frase.length()).trim();
                nombre =
                        nombre.replaceFirst(
                                "(?i)^(la persona|el beneficiario|la beneficiaria|beneficiario|beneficiaria)\\s+",
                                "");
                nombre = nombre.replaceAll("[?.!,;:]+$", "").trim();
                return nombre.isBlank() ? null : nombre;
            }
        }
        return null;
    }

    private Usuario obtenerUsuarioActual() {
        return usuarioRepository
                .findByNombreUsuario(nombreUsuarioActual())
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Usuario autenticado"));
    }

    private String nombreUsuarioActual() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null || autenticacion.getName() == null) {
            throw new AccessDeniedException("No existe un usuario autenticado");
        }
        return autenticacion.getName();
    }

    private String rolActual() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null) {
            throw new AccessDeniedException("No existe un usuario autenticado");
        }

        return autenticacion.getAuthorities().stream()
                .map(autoridad -> autoridad.getAuthority())
                .filter(autoridad -> autoridad.startsWith("ROLE_"))
                .map(autoridad -> autoridad.substring(5))
                .findFirst()
                .orElseThrow(() -> new AccessDeniedException("El usuario no tiene un rol valido"));
    }

    private void exigirRol(String rolEsperado) {
        String rol = rolActual();
        if (!rolEsperado.equals(rol)) {
            throw new AccessDeniedException("Esta operacion requiere rol " + rolEsperado);
        }
    }

    private RespuestaIaDto construirRespuesta(
            String respuesta, String tipoConsulta, String rol, Long idBeneficiario) {
        return RespuestaIaDto.builder()
                .respuesta(respuesta)
                .tipoConsulta(tipoConsulta)
                .rol(rol)
                .idBeneficiario(idBeneficiario)
                .datosPersonalesProtegidos(true)
                .build();
    }

    private void registrarAuditoria(Long idBeneficiario, String operacion, String rol) {
        auditoriaService.registrar(
                "AsistenteIA",
                idBeneficiario,
                operacion,
                null,
                Map.of("rol", rol, "datosPersonalesProtegidos", true),
                "Consulta procesada por el asistente IA");
    }
}
