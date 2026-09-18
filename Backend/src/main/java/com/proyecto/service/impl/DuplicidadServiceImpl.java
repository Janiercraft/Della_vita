package com.proyecto.service.impl;

import com.proyecto.dto.BeneficiarioDto;
import com.proyecto.dto.DecisionDuplicidadDto;
import com.proyecto.dto.UnificacionDto;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.Beneficiario;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.AuditoriaService;
import com.proyecto.service.BeneficiarioService;
import com.proyecto.service.DuplicidadService;
import com.proyecto.service.UnificacionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DuplicidadServiceImpl implements DuplicidadService {
    private final BeneficiarioRepository repository;
    private final BeneficiarioService beneficiarioService;
    private final UnificacionService unificacionService;
    private final AuditoriaService auditoriaService;

    @Override
    public List<BeneficiarioDto> listarPendientes() {
        return repository
                .findByEstadoRevisionDuplicidadOrderByDtCreacionAsc("EN_REVISION_DUPLICIDAD")
                .stream()
                .map(registro -> beneficiarioService.consultar(registro.getId()))
                .toList();
    }

    @Override
    public List<BeneficiarioDto> candidatos(Long idBeneficiario) {
        Beneficiario registro = obtener(idBeneficiario);
        if (registro.getFechaNacimiento() == null) {
            return List.of();
        }
        return repository
                .findByNombreNormalizadoAndFechaNacimientoOrderById(
                        registro.getNombreNormalizado(), registro.getFechaNacimiento())
                .stream()
                .filter(candidato -> !candidato.getId().equals(idBeneficiario))
                .map(candidato -> beneficiarioService.consultar(candidato.getId()))
                .toList();
    }

    @Override
    @Transactional
    public BeneficiarioDto resolver(Long idBeneficiario, DecisionDuplicidadDto dto) {
        Beneficiario registro = obtener(idBeneficiario);
        if (!Objects.equals(registro.getVersion(), dto.getVersion())) {
            throw ExcepcionNegocio.conflicto(
                    "El posible duplicado fue modificado; consulte nuevamente");
        }
        if (!"EN_REVISION_DUPLICIDAD".equals(registro.getEstadoRevisionDuplicidad())) {
            throw ExcepcionNegocio.conflicto(
                    "El beneficiario no se encuentra pendiente de revision por duplicidad");
        }

        if ("ACEPTAR".equals(dto.getAccion())) {
            registro.setEstadoRevisionDuplicidad("APROBADO");
            repository.saveAndFlush(registro);
            auditoriaService.registrar(
                    "Beneficiario",
                    registro.getId(),
                    "APROBAR_DUPLICIDAD",
                    "EN_REVISION_DUPLICIDAD",
                    "APROBADO",
                    dto.getMotivo());
            log.info("Posible duplicado aceptado como persona independiente, id={}", idBeneficiario);
            return beneficiarioService.consultar(idBeneficiario);
        }

        if ("DESCARTAR".equals(dto.getAccion())) {
            registro.setEstadoRevisionDuplicidad("DESCARTADO");
            registro.setActivo(false);
            repository.saveAndFlush(registro);
            auditoriaService.registrar(
                    "Beneficiario",
                    registro.getId(),
                    "DESCARTAR_DUPLICIDAD",
                    "EN_REVISION_DUPLICIDAD",
                    "DESCARTADO",
                    dto.getMotivo());
            log.info("Posible duplicado descartado, id={}", idBeneficiario);
            return beneficiarioService.consultar(idBeneficiario);
        }

        if (dto.getIdDestino() == null || dto.getVersionDestino() == null) {
            throw ExcepcionNegocio.invalido(
                    "Para FUSIONAR debe informar idDestino y versionDestino");
        }

        registro.setEstadoRevisionDuplicidad("FUSIONADO");
        repository.saveAndFlush(registro);
        BeneficiarioDto resultado =
                unificacionService.unificar(
                        UnificacionDto.builder()
                                .idOrigen(idBeneficiario)
                                .idDestino(dto.getIdDestino())
                                .versionOrigen(registro.getVersion())
                                .versionDestino(dto.getVersionDestino())
                                .motivo(dto.getMotivo())
                                .build());
        log.info(
                "Posible duplicado fusionado, origen={}, destino={}",
                idBeneficiario,
                dto.getIdDestino());
        return resultado;
    }

    private Beneficiario obtener(Long id) {
        return repository.findById(id).orElseThrow(() -> ExcepcionNegocio.noEncontrado("Beneficiario"));
    }
}
