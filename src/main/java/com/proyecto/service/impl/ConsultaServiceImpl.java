package com.proyecto.service.impl;

import com.proyecto.dto.HistorialDto;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.Paginacion;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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

    @Override
    public HistorialDto historial(Long id, int pagina, int tamanio) {
        Pageable paginacion = Paginacion.crear(pagina, tamanio);
        return HistorialDto.builder()
                .beneficiario(beneficiarioService.consultar(id))
                .participaciones(participacionRepository.findByIdBeneficiario(id, paginacion))
                .atenciones(atencionRepository.consultarPorBeneficiario(id, paginacion))
                .seguimientos(seguimientoRepository.consultarPorBeneficiario(id, paginacion))
                .build();
    }

    @Override
    public Map<String, Long> resumen() {
        return Map.of(
                "personasSinUnificados",
                beneficiarioRepository.countByIdBeneficiarioPrincipalIsNull(),
                "beneficiariosRegistrados",
                beneficiarioRepository.count(),
                "programasRegistrados",
                programaRepository.count(),
                "participacionesRegistradas",
                participacionRepository.count(),
                "atencionesRegistradas",
                atencionRepository.count(),
                "seguimientosRegistrados",
                seguimientoRepository.count());
    }
}
