package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.FiltroDatosIaService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FiltroDatosIaServiceImpl implements FiltroDatosIaService {
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProgramaRepository programaRepository;
    private final ParticipacionRepository participacionRepository;
    private final AtencionRepository atencionRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public ResumenIaDto prepararResumenSeguro() {
        log.info("Preparando resumen agregado y seguro para IA");

        Map<String, Long> porMunicipio = new LinkedHashMap<>();
        for (Object[] fila : beneficiarioRepository.contarBeneficiariosPorMunicipio()) {
            String municipio = fila[0] == null ? "SIN MUNICIPIO" : fila[0].toString();
            Long total = ((Number) fila[1]).longValue();
            porMunicipio.put(municipio, total);
        }

        return ResumenIaDto.builder()
                .beneficiariosRegistrados(beneficiarioRepository.count())
                .programasRegistrados(programaRepository.count())
                .participacionesRegistradas(participacionRepository.count())
                .atencionesRegistradas(atencionRepository.count())
                .seguimientosRegistrados(seguimientoRepository.count())
                .seguimientosPendientes(
                        seguimientoRepository.countByEstadoSeguimientoIgnoreCaseAndActivoTrue("PENDIENTE"))
                .beneficiariosPorMunicipio(porMunicipio)
                .build();
    }

    @Override
    public BeneficiarioIaAdminDto prepararBeneficiarioAdmin(Long idBeneficiario) {
        log.info("Preparando contexto ADMIN protegido para IA, beneficiarioId={}", idBeneficiario);

        Beneficiario beneficiario = obtenerBeneficiario(idBeneficiario);
        List<Participacion> participaciones = obtenerParticipaciones(idBeneficiario);

        List<String> programas = new ArrayList<>();
        List<String> detalleParticipaciones = new ArrayList<>();
        List<String> atenciones = new ArrayList<>();
        List<String> seguimientos = new ArrayList<>();

        for (Participacion participacion : participaciones) {
            String nombrePrograma = obtenerNombrePrograma(participacion.getIdPrograma());
            programas.add(nombrePrograma);

            detalleParticipaciones.add(
                    "Programa="
                            + nombrePrograma
                            + ", periodo="
                            + participacion.getPeriodo()
                            + ", fechaIngreso="
                            + participacion.getFechaIngreso()
                            + textoOpcional(", observaciones=", participacion.getObservaciones()));

            List<Atencion> listaAtenciones =
                    atencionRepository
                            .findByIdParticipacion(participacion.getId(), PageRequest.of(0, 100))
                            .getContent();
            for (Atencion atencion : listaAtenciones) {
                atenciones.add(
                        "Fecha="
                                + atencion.getFechaAtencion()
                                + ", tipo="
                                + atencion.getTipoAtencion()
                                + ", funcionario="
                                + atencion.getUsuarioCreacion()
                                + ", validacionAyuda="
                                + atencion.getEstadoValidacionAyuda()
                                + textoOpcional(", observaciones=", atencion.getObservaciones()));
            }

            List<Seguimiento> listaSeguimientos =
                    seguimientoRepository
                            .findByIdParticipacion(participacion.getId(), PageRequest.of(0, 100))
                            .getContent();
            for (Seguimiento seguimiento : listaSeguimientos) {
                seguimientos.add(
                        "Fecha="
                                + seguimiento.getFechaSeguimiento()
                                + ", estado="
                                + seguimiento.getEstadoSeguimiento()
                                + textoOpcional(", proximoSeguimiento=", seguimiento.getFechaProximoSeguimiento())
                                + ", funcionario="
                                + seguimiento.getUsuarioCreacion()
                                + textoOpcional(", observaciones=", seguimiento.getObservaciones()));
            }
        }

        return BeneficiarioIaAdminDto.builder()
                .id(beneficiario.getId())
                .codigoInterno(beneficiario.getCodigoInterno())
                .nombreCompleto(nombreCompleto(beneficiario))
                .edad(calcularEdad(beneficiario.getFechaNacimiento()))
                .municipio(beneficiario.getMunicipio())
                .tipoDocumento(beneficiario.getTipoDocumento())
                .documentoEnmascarado(enmascarar(beneficiario.getNumeroDocumento(), 4))
                .celularEnmascarado(enmascarar(beneficiario.getCelular(), 4))
                .estadoRevisionDuplicidad(beneficiario.getEstadoRevisionDuplicidad())
                .estadoConsentimiento(beneficiario.getEstadoConsentimiento())
                .programas(programas.stream().distinct().toList())
                .participaciones(detalleParticipaciones)
                .atenciones(atenciones)
                .seguimientos(seguimientos)
                .build();
    }

    @Override
    public BeneficiarioIaUsuarioDto prepararBeneficiarioUsuario(Long idBeneficiario) {
        log.info("Preparando contexto limitado para usuario final, beneficiarioId={}", idBeneficiario);

        Beneficiario beneficiario = obtenerBeneficiario(idBeneficiario);
        List<Participacion> participaciones = obtenerParticipaciones(idBeneficiario);

        List<String> programas = new ArrayList<>();
        List<String> atenciones = new ArrayList<>();
        List<String> seguimientos = new ArrayList<>();

        for (Participacion participacion : participaciones) {
            String nombrePrograma = obtenerNombrePrograma(participacion.getIdPrograma());
            programas.add(nombrePrograma);

            List<Atencion> listaAtenciones =
                    atencionRepository
                            .findByIdParticipacion(participacion.getId(), PageRequest.of(0, 100))
                            .getContent();
            for (Atencion atencion : listaAtenciones) {
                if (!"NO_APLICA".equals(atencion.getEstadoValidacionAyuda())
                        && !"VALIDADA".equals(atencion.getEstadoValidacionAyuda())) {
                    continue;
                }
                atenciones.add(
                        "Fecha="
                                + atencion.getFechaAtencion()
                                + ", tipo="
                                + atencion.getTipoAtencion()
                                + ", programa="
                                + nombrePrograma);
            }

            List<Seguimiento> listaSeguimientos =
                    seguimientoRepository
                            .findByIdParticipacion(participacion.getId(), PageRequest.of(0, 100))
                            .getContent();
            for (Seguimiento seguimiento : listaSeguimientos) {
                seguimientos.add(
                        "Fecha="
                                + seguimiento.getFechaSeguimiento()
                                + ", estado="
                                + seguimiento.getEstadoSeguimiento()
                                + textoOpcional(", proximoSeguimiento=", seguimiento.getFechaProximoSeguimiento())
                                + ", programa="
                                + nombrePrograma);
            }
        }

        return BeneficiarioIaUsuarioDto.builder()
                .id(beneficiario.getId())
                .nombreCompleto(nombreCompleto(beneficiario))
                .municipio(beneficiario.getMunicipio())
                .programas(programas.stream().distinct().toList())
                .atencionesRecibidas(atenciones)
                .seguimientos(seguimientos)
                .build();
    }

    @Override
    public FuncionarioIaDto prepararFuncionario(String nombreUsuario) {
        log.info("Preparando contexto limitado para funcionario, usuario={}", nombreUsuario);

        Usuario usuario =
                usuarioRepository
                        .findByNombreUsuario(nombreUsuario)
                        .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Usuario funcionario"));

        if (!"OPERADOR".equals(usuario.getRol())) {
            throw ExcepcionNegocio.invalido("El usuario autenticado no tiene rol OPERADOR");
        }

        PageRequest limiteAtenciones =
                PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "fechaAtencion"));
        PageRequest limiteSeguimientos =
                PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "fechaSeguimiento"));

        List<Atencion> atenciones =
                atencionRepository.findByUsuarioCreacion(nombreUsuario, limiteAtenciones).getContent();
        List<Seguimiento> seguimientos =
                seguimientoRepository.findByUsuarioCreacion(nombreUsuario, limiteSeguimientos).getContent();

        LocalDate hoy = LocalDate.now();
        LocalDate inicioSemana = hoy.minusDays(hoy.getDayOfWeek().getValue() - 1L);
        int atencionesHoy = 0;
        int atencionesSemana = 0;
        int seguimientosHoy = 0;
        int seguimientosSemana = 0;

        List<String> detalleAtenciones = new ArrayList<>();
        for (Atencion atencion : atenciones) {
            Participacion participacion = obtenerParticipacion(atencion.getIdParticipacion());
            Beneficiario beneficiario = obtenerBeneficiario(participacion.getIdBeneficiario());
            if (usuario.getMunicipioAsignado() != null
                    && !usuario.getMunicipioAsignado().equalsIgnoreCase(beneficiario.getMunicipio())) {
                continue;
            }
            if (hoy.equals(atencion.getFechaAtencion())) {
                atencionesHoy++;
            }
            if (!atencion.getFechaAtencion().isBefore(inicioSemana)
                    && !atencion.getFechaAtencion().isAfter(hoy)) {
                atencionesSemana++;
            }
            detalleAtenciones.add(
                    "Fecha="
                            + atencion.getFechaAtencion()
                            + ", beneficiario="
                            + nombreCompleto(beneficiario)
                            + ", documento="
                            + enmascarar(beneficiario.getNumeroDocumento(), 4)
                            + ", programa="
                            + obtenerNombrePrograma(participacion.getIdPrograma())
                            + ", tipo="
                            + atencion.getTipoAtencion()
                            + ", validacionAyuda="
                            + atencion.getEstadoValidacionAyuda());
        }

        List<String> detalleSeguimientos = new ArrayList<>();
        for (Seguimiento seguimiento : seguimientos) {
            Participacion participacion = obtenerParticipacion(seguimiento.getIdParticipacion());
            Beneficiario beneficiario = obtenerBeneficiario(participacion.getIdBeneficiario());
            if (usuario.getMunicipioAsignado() != null
                    && !usuario.getMunicipioAsignado().equalsIgnoreCase(beneficiario.getMunicipio())) {
                continue;
            }
            if (hoy.equals(seguimiento.getFechaSeguimiento())) {
                seguimientosHoy++;
            }
            if (!seguimiento.getFechaSeguimiento().isBefore(inicioSemana)
                    && !seguimiento.getFechaSeguimiento().isAfter(hoy)) {
                seguimientosSemana++;
            }
            detalleSeguimientos.add(
                    "Fecha="
                            + seguimiento.getFechaSeguimiento()
                            + ", beneficiario="
                            + nombreCompleto(beneficiario)
                            + ", documento="
                            + enmascarar(beneficiario.getNumeroDocumento(), 4)
                            + ", programa="
                            + obtenerNombrePrograma(participacion.getIdPrograma())
                            + ", estado="
                            + seguimiento.getEstadoSeguimiento()
                            + textoOpcional(", proximoSeguimiento=", seguimiento.getFechaProximoSeguimiento()));
        }

        return FuncionarioIaDto.builder()
                .nombreUsuario(usuario.getNombreUsuario())
                .nombreCompleto(usuario.getNombreCompleto())
                .municipioAsignado(usuario.getMunicipioAsignado())
                .totalAtenciones(detalleAtenciones.size())
                .totalSeguimientos(detalleSeguimientos.size())
                .atencionesHoy(atencionesHoy)
                .atencionesSemana(atencionesSemana)
                .seguimientosHoy(seguimientosHoy)
                .seguimientosSemana(seguimientosSemana)
                .atencionesRealizadas(detalleAtenciones)
                .seguimientosRealizados(detalleSeguimientos)
                .build();
    }

    private Beneficiario obtenerBeneficiario(Long idBeneficiario) {
        return beneficiarioRepository
                .findById(idBeneficiario)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
    }

    private Participacion obtenerParticipacion(Long idParticipacion) {
        return participacionRepository
                .findById(idParticipacion)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Participacion"));
    }

    private List<Participacion> obtenerParticipaciones(Long idBeneficiario) {
        return participacionRepository
                .findByIdBeneficiario(idBeneficiario, PageRequest.of(0, 200))
                .getContent();
    }

    private String obtenerNombrePrograma(Long idPrograma) {
        return programaRepository
                .findById(idPrograma)
                .map(Programa::getNombre)
                .orElse("Programa no disponible");
    }

    private String nombreCompleto(Beneficiario beneficiario) {
        return String.join(
                        " ",
                        Objects.toString(beneficiario.getPrimerNombre(), ""),
                        Objects.toString(beneficiario.getSegundoNombre(), ""),
                        Objects.toString(beneficiario.getPrimerApellido(), ""),
                        Objects.toString(beneficiario.getSegundoApellido(), ""))
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    private String enmascarar(String valor, int visibles) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        if (valor.length() <= visibles) {
            return "XXXX";
        }
        return "X".repeat(valor.length() - visibles) + valor.substring(valor.length() - visibles);
    }

    private String textoOpcional(String prefijo, Object valor) {
        if (valor == null || valor.toString().isBlank()) {
            return "";
        }
        return prefijo + valor;
    }
}
