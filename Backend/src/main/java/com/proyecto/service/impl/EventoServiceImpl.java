package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventoServiceImpl implements EventoService {
    private final EventoRepository eventoRepository;
    private final InscripcionEventoRepository inscripcionRepository;
    private final ProgramaRepository programaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ParticipacionRepository participacionRepository;
    private final ParticipacionService participacionService;
    private final ControlAccesoService controlAcceso;

    @Override
    @Transactional
    public EventoDto crear(EventoDto dto) {
        validarEvento(dto);
        Evento e = new Evento();
        copiar(dto, e);
        return toDto(eventoRepository.saveAndFlush(e));
    }

    @Override
    @Transactional
    public EventoDto editar(Long id, EventoDto dto) {
        validarEvento(dto);
        Evento e = eventoRepository.findById(id).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Evento"));
        if (dto.getVersion() == null || !Objects.equals(dto.getVersion(), e.getVersion())) {
            throw ExcepcionNegocio.conflicto("El evento fue modificado por otro usuario; consulte nuevamente");
        }
        copiar(dto, e);
        if (dto.getActivo() != null) e.setActivo(dto.getActivo());
        return toDto(eventoRepository.saveAndFlush(e));
    }

    @Override
    public List<EventoDto> listar(Long idPrograma, Boolean soloActivos) {
        List<Evento> eventos;
        if (idPrograma != null) eventos = eventoRepository.findByIdProgramaAndActivoTrueOrderByFechaInicioAsc(idPrograma);
        else if (Boolean.TRUE.equals(soloActivos)) eventos = eventoRepository.findByActivoTrueOrderByFechaInicioAsc();
        else eventos = eventoRepository.findAll().stream().sorted(Comparator.comparing(Evento::getFechaInicio)).toList();
        return eventos.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public PostulacionProgramaDto postularme(Long idPrograma) {
        Usuario usuario = controlAcceso.usuarioActual();
        if (!"CONSULTA".equals(usuario.getRol()) || usuario.getIdBeneficiario() == null) {
            throw new ExcepcionNegocio(HttpStatus.FORBIDDEN, "Esta operacion es exclusiva del portal del beneficiario");
        }
        Long idBeneficiario = usuario.getIdBeneficiario();
        Beneficiario ben = beneficiarioRepository.findById(idBeneficiario).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
        if (!Boolean.TRUE.equals(ben.getActivo())) throw ExcepcionNegocio.conflicto("Beneficiario esta inactivo");
        Programa programa = programaRepository.findById(idPrograma).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Programa"));
        if (!Boolean.TRUE.equals(programa.getActivo())) throw ExcepcionNegocio.conflicto("Programa esta inactivo");

        String periodo = String.valueOf(LocalDate.now().getYear());
        ParticipacionDto participacion;
        var existente = participacionRepository.findByIdBeneficiarioAndIdProgramaAndPeriodo(idBeneficiario, idPrograma, periodo);
        if (existente.isPresent()) {
            participacion = convertirParticipacion(existente.get());
        } else {
            ParticipacionDto nueva = ParticipacionDto.builder()
                    .idBeneficiario(idBeneficiario).idPrograma(idPrograma).periodo(periodo)
                    .fechaIngreso(LocalDate.now()).estadoParticipacion("INSCRITO")
                    .observaciones("Postulacion realizada por el beneficiario desde el portal de autogestion")
                    .build();
            participacion = participacionService.guardar(nueva);
        }

        List<InscripcionEventoDto> vinculados = new ArrayList<>();
        for (Evento evento : eventoRepository.findByIdProgramaAndActivoTrueAndFechaFinGreaterThanEqualOrderByFechaInicioAsc(idPrograma, LocalDateTime.now())) {
            try {
                vinculados.add(inscribirEnEvento(evento, idBeneficiario));
            } catch (ExcepcionNegocio ex) {
                // Al postularse a un programa se vincula a todos los eventos con cupo.
                // Si uno ya no tiene cupo, se omite sin impedir la postulacion al programa.
                if (ex.getEstado() == HttpStatus.CONFLICT) {
                    continue;
                }
                throw ex;
            }
        }
        return PostulacionProgramaDto.builder().participacion(participacion)
                .eventosVinculados(vinculados).cantidadEventosVinculados(vinculados.size()).build();
    }

    @Override
    @Transactional
    public InscripcionEventoDto postularmeEvento(Long idEvento) {
        Usuario usuario = beneficiarioActual();
        Evento evento = eventoRepository.findById(idEvento)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Evento"));
        if (!Boolean.TRUE.equals(evento.getActivo())) {
            throw ExcepcionNegocio.conflicto("El evento esta inactivo");
        }
        if (evento.getFechaFin() != null && evento.getFechaFin().isBefore(LocalDateTime.now())) {
            throw ExcepcionNegocio.conflicto("El evento ya finalizo");
        }

        // Una postulacion individual al evento tambien garantiza la participacion
        // del beneficiario en el programa al que pertenece el evento.
        asegurarParticipacionPrograma(usuario.getIdBeneficiario(), evento.getIdPrograma());
        return inscribirEnEvento(evento, usuario.getIdBeneficiario());
    }

    @Override
    @Transactional
    public InscripcionEventoDto cancelarMiInscripcionEvento(Long idEvento) {
        Usuario usuario = beneficiarioActual();
        Evento evento = eventoRepository.findById(idEvento)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Evento"));
        InscripcionEvento inscripcion = inscripcionRepository
                .findByIdEventoAndIdBeneficiario(idEvento, usuario.getIdBeneficiario())
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Inscripcion al evento"));

        inscripcion.setActivo(false);
        inscripcion.setEstado("CANCELADO");
        return toInscripcionDto(inscripcionRepository.saveAndFlush(inscripcion), evento);
    }

    @Override
    public List<ParticipacionDto> misParticipaciones() {
        Usuario usuario = controlAcceso.usuarioActual();
        if (!"CONSULTA".equals(usuario.getRol()) || usuario.getIdBeneficiario() == null) {
            throw new ExcepcionNegocio(HttpStatus.FORBIDDEN, "Esta operacion es exclusiva del portal del beneficiario");
        }
        return participacionRepository.findByIdBeneficiarioAndActivoTrueOrderByFechaIngresoDesc(usuario.getIdBeneficiario())
                .stream().map(this::convertirParticipacion).toList();
    }

    @Override
    public List<InscripcionEventoDto> misEventos() {
        Usuario usuario = controlAcceso.usuarioActual();
        if (!"CONSULTA".equals(usuario.getRol()) || usuario.getIdBeneficiario() == null) {
            throw new ExcepcionNegocio(HttpStatus.FORBIDDEN, "Esta operacion es exclusiva del portal del beneficiario");
        }
        return inscripcionRepository.findByIdBeneficiarioAndActivoTrueOrderByFechaInscripcionDesc(usuario.getIdBeneficiario())
                .stream().map(i -> eventoRepository.findById(i.getIdEvento()).map(e -> toInscripcionDto(i,e)).orElse(null))
                .filter(Objects::nonNull).toList();
    }

    private Usuario beneficiarioActual() {
        Usuario usuario = controlAcceso.usuarioActual();
        if (!"CONSULTA".equals(usuario.getRol()) || usuario.getIdBeneficiario() == null) {
            throw new ExcepcionNegocio(HttpStatus.FORBIDDEN, "Esta operacion es exclusiva del portal del beneficiario");
        }
        Beneficiario beneficiario = beneficiarioRepository.findById(usuario.getIdBeneficiario())
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
        if (!Boolean.TRUE.equals(beneficiario.getActivo())) {
            throw ExcepcionNegocio.conflicto("Beneficiario esta inactivo");
        }
        return usuario;
    }

    private void asegurarParticipacionPrograma(Long idBeneficiario, Long idPrograma) {
        Programa programa = programaRepository.findById(idPrograma)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Programa"));
        if (!Boolean.TRUE.equals(programa.getActivo())) {
            throw ExcepcionNegocio.conflicto("Programa esta inactivo");
        }
        String periodo = String.valueOf(LocalDate.now().getYear());
        if (participacionRepository.findByIdBeneficiarioAndIdProgramaAndPeriodo(idBeneficiario, idPrograma, periodo).isEmpty()) {
            ParticipacionDto nueva = ParticipacionDto.builder()
                    .idBeneficiario(idBeneficiario)
                    .idPrograma(idPrograma)
                    .periodo(periodo)
                    .fechaIngreso(LocalDate.now())
                    .estadoParticipacion("INSCRITO")
                    .observaciones("Vinculacion automatica al postularse a un evento")
                    .build();
            participacionService.guardar(nueva);
        }
    }

    private InscripcionEventoDto inscribirEnEvento(Evento evento, Long idBeneficiario) {
        Optional<InscripcionEvento> existente =
                inscripcionRepository.findByIdEventoAndIdBeneficiario(evento.getId(), idBeneficiario);
        if (existente.isPresent() && Boolean.TRUE.equals(existente.get().getActivo())) {
            return toInscripcionDto(existente.get(), evento);
        }
        if (evento.getCupo() != null
                && inscripcionRepository.countByIdEventoAndActivoTrue(evento.getId()) >= evento.getCupo()) {
            throw ExcepcionNegocio.conflicto("El evento no tiene cupos disponibles");
        }

        InscripcionEvento inscripcion = existente.orElseGet(() -> InscripcionEvento.builder()
                .idEvento(evento.getId())
                .idBeneficiario(idBeneficiario)
                .build());
        inscripcion.setActivo(true);
        inscripcion.setEstado("INSCRITO");
        inscripcion.setFechaInscripcion(LocalDateTime.now());
        return toInscripcionDto(inscripcionRepository.saveAndFlush(inscripcion), evento);
    }

    private void validarEvento(EventoDto dto) {
        Programa p = programaRepository.findById(dto.getIdPrograma()).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Programa"));
        if (!Boolean.TRUE.equals(p.getActivo())) throw ExcepcionNegocio.conflicto("Programa esta inactivo");
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) throw ExcepcionNegocio.invalido("La fecha de fin no puede ser anterior a la fecha de inicio");
    }
    private void copiar(EventoDto dto, Evento e) {
        e.setIdPrograma(dto.getIdPrograma()); e.setNombre(dto.getNombre().trim()); e.setDescripcion(dto.getDescripcion());
        e.setFechaInicio(dto.getFechaInicio()); e.setFechaFin(dto.getFechaFin()); e.setLugar(dto.getLugar().trim()); e.setCupo(dto.getCupo());
    }
    private EventoDto toDto(Evento e) {
        return EventoDto.builder().id(e.getId()).version(e.getVersion()).activo(e.getActivo()).dtCreacion(e.getDtCreacion()).dtActualizacion(e.getDtActualizacion())
                .idPrograma(e.getIdPrograma()).nombre(e.getNombre()).descripcion(e.getDescripcion()).fechaInicio(e.getFechaInicio()).fechaFin(e.getFechaFin())
                .lugar(e.getLugar()).cupo(e.getCupo()).inscritos(inscripcionRepository.countByIdEventoAndActivoTrue(e.getId())).build();
    }
    private InscripcionEventoDto toInscripcionDto(InscripcionEvento i, Evento e) {
        return InscripcionEventoDto.builder().id(i.getId()).idEvento(e.getId()).idBeneficiario(i.getIdBeneficiario()).nombreEvento(e.getNombre())
                .fechaInicio(e.getFechaInicio()).lugar(e.getLugar()).fechaInscripcion(i.getFechaInscripcion()).estado(i.getEstado()).build();
    }
    private ParticipacionDto convertirParticipacion(Participacion p) {
        return ParticipacionDto.builder().id(p.getId()).version(p.getVersion()).activo(p.getActivo()).dtCreacion(p.getDtCreacion()).dtActualizacion(p.getDtActualizacion())
                .usuarioCreacion(p.getUsuarioCreacion()).usuarioActualizacion(p.getUsuarioActualizacion()).idBeneficiario(p.getIdBeneficiario()).idPrograma(p.getIdPrograma())
                .periodo(p.getPeriodo()).fechaIngreso(p.getFechaIngreso()).estadoParticipacion(p.getEstadoParticipacion()).observaciones(p.getObservaciones()).build();
    }
}
