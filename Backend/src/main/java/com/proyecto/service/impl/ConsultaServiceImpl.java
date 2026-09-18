package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.Paginacion;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultaServiceImpl implements ConsultaService {
    private final BeneficiarioService beneficiarioService;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProgramaRepository programaRepository;
    private final ParticipacionRepository participacionRepository;
    private final AtencionRepository atencionRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final IntegranteFamiliaRepository integranteFamiliaRepository;
    private final FamiliaRepository familiaRepository;

    @Override
    public HistorialDto historial(Long id, int pagina, int tamanio) {
        Pageable paginacion = Paginacion.crear(pagina, tamanio);
        Page<Participacion> participaciones =
                participacionRepository.findByIdBeneficiario(id, paginacion);

        List<FamiliaHistorialDto> familia =
                integranteFamiliaRepository.consultarPorBeneficiario(id).stream()
                        .map(this::convertirFamiliaHistorial)
                        .toList();

        Page<ParticipacionDetalleDto> participacionesDetalle =
                participaciones.map(this::convertirParticipacionDetalle);

        return HistorialDto.builder()
                .beneficiario(beneficiarioService.consultar(id))
                .familia(familia)
                .participaciones(participaciones)
                .participacionesDetalle(participacionesDetalle)
                .atenciones(atencionRepository.consultarPorBeneficiario(id, paginacion))
                .seguimientos(seguimientoRepository.consultarPorBeneficiario(id, paginacion))
                .build();
    }

    private FamiliaHistorialDto convertirFamiliaHistorial(IntegranteFamilia integrante) {
        Familia familia = familiaRepository.findById(integrante.getIdFamilia()).orElse(null);
        return FamiliaHistorialDto.builder()
                .idIntegranteFamilia(integrante.getId())
                .idFamilia(integrante.getIdFamilia())
                .nombreFamilia(familia == null ? null : familia.getNombre())
                .municipioFamilia(familia == null ? null : familia.getMunicipio())
                .idBeneficiario(integrante.getIdBeneficiario())
                .parentesco(integrante.getParentesco())
                .activo(integrante.getActivo())
                .build();
    }

    private ParticipacionDetalleDto convertirParticipacionDetalle(Participacion participacion) {
        Programa programa = programaRepository.findById(participacion.getIdPrograma()).orElse(null);
        return ParticipacionDetalleDto.builder()
                .id(participacion.getId())
                .idBeneficiario(participacion.getIdBeneficiario())
                .idPrograma(participacion.getIdPrograma())
                .nombrePrograma(programa == null ? null : programa.getNombre())
                .lineaIntervencion(programa == null ? null : programa.getLineaIntervencion())
                .periodo(participacion.getPeriodo())
                .fechaIngreso(participacion.getFechaIngreso())
                .estadoParticipacion(participacion.getEstadoParticipacion())
                .observaciones(participacion.getObservaciones())
                .activo(participacion.getActivo())
                .build();
    }

    @Override
    public Map<String, Object> resumen() {
        Map<String, Long> participacionesPorPrograma = new LinkedHashMap<>();
        for (Object[] fila : participacionRepository.contarParticipacionesActivasPorPrograma()) {
            participacionesPorPrograma.put(String.valueOf(fila[0]), ((Number) fila[1]).longValue());
        }

        Map<String, Object> resumen = new LinkedHashMap<>();

        // Se conservan los indicadores existentes.
        resumen.put(
                "personasSinUnificados",
                beneficiarioRepository.countByIdBeneficiarioPrincipalIsNull());
        resumen.put("beneficiariosRegistrados", beneficiarioRepository.count());
        resumen.put("programasRegistrados", programaRepository.count());
        resumen.put("participacionesRegistradas", participacionRepository.count());
        resumen.put("atencionesRegistradas", atencionRepository.count());
        resumen.put("seguimientosRegistrados", seguimientoRepository.count());

        // Indicadores expresos solicitados por la guia del reto.
        resumen.put(
                "beneficiariosUnicos",
                beneficiarioRepository.countByIdBeneficiarioPrincipalIsNullAndActivoTrue());
        resumen.put(
                "seguimientosPendientes",
                seguimientoRepository.countByEstadoSeguimientoIgnoreCaseAndActivoTrue("PENDIENTE"));
        resumen.put("participacionesPorPrograma", participacionesPorPrograma);

        return resumen;
    }
}
