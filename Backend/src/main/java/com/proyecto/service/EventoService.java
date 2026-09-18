package com.proyecto.service;

import com.proyecto.dto.*;
import java.util.*;

public interface EventoService {
    EventoDto crear(EventoDto dto);
    EventoDto editar(Long id, EventoDto dto);
    List<EventoDto> listar(Long idPrograma, Boolean soloActivos);
    PostulacionProgramaDto postularme(Long idPrograma);
    InscripcionEventoDto postularmeEvento(Long idEvento);
    InscripcionEventoDto cancelarMiInscripcionEvento(Long idEvento);
    List<InscripcionEventoDto> misEventos();
    List<ParticipacionDto> misParticipaciones();
}
