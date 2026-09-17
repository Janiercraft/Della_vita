package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.Beneficiario;
import com.proyecto.repository.*;
import com.proyecto.service.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnificacionServiceImpl implements UnificacionService {
    private final BeneficiarioRepository repository;
    private final ControlImportacionRepository controlRepository;
    private final BeneficiarioService beneficiarioService;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional
    public BeneficiarioDto unificar(UnificacionDto dto) {
        if (dto.getIdOrigen().equals(dto.getIdDestino())) {
            throw ExcepcionNegocio.invalido("Origen y destino deben ser distintos");
        }
        controlRepository.bloquearProcesamiento();
        List<Beneficiario> bloqueados =
                repository.bloquearParaUnificar(List.of(dto.getIdOrigen(), dto.getIdDestino()));
        if (bloqueados.size() != 2) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario de origen o destino");
        }
        Beneficiario origen =
                bloqueados.get(0).getId().equals(dto.getIdOrigen())
                        ? bloqueados.get(0)
                        : bloqueados.get(1);
        Beneficiario destino =
                bloqueados.get(0).getId().equals(dto.getIdDestino())
                        ? bloqueados.get(0)
                        : bloqueados.get(1);
        if (!origen.getVersion().equals(dto.getVersionOrigen())
                || !destino.getVersion().equals(dto.getVersionDestino())) {
            throw ExcepcionNegocio.conflicto(
                    "Las fichas cambiaron; consulte sus versiones actuales");
        }
        if (origen.getIdBeneficiarioPrincipal() != null
                || destino.getIdBeneficiarioPrincipal() != null
                || !destino.getActivo()) {
            throw ExcepcionNegocio.conflicto("Utilice dos fichas principales y un destino activo");
        }
        if (origen.getNumeroDocumento() != null
                && destino.getNumeroDocumento() != null
                && (!origen.getTipoDocumento().equals(destino.getTipoDocumento())
                        || !origen.getNumeroDocumento().equals(destino.getNumeroDocumento()))) {
            throw ExcepcionNegocio.conflicto(
                    "Las fichas tienen documentos distintos; corrija y audite esa discrepancia"
                            + " antes de unificar");
        }
        BeneficiarioDto anterior = beneficiarioService.consultar(origen.getId());
        // Se conservan las fichas y sus relaciones originales. El historial del principal incluye
        // los alias.
        origen.setIdBeneficiarioPrincipal(destino.getId());
        origen.setActivo(false);
        repository.saveAndFlush(origen);
        for (Beneficiario alias : repository.findByIdBeneficiarioPrincipal(origen.getId())) {
            Long principalAnterior = alias.getIdBeneficiarioPrincipal();
            alias.setIdBeneficiarioPrincipal(destino.getId());
            repository.save(alias);
            auditoriaService.registrar(
                    "Beneficiario",
                    alias.getId(),
                    "REASIGNAR_PRINCIPAL",
                    principalAnterior,
                    destino.getId(),
                    dto.getMotivo());
        }
        auditoriaService.registrar(
                "Beneficiario",
                origen.getId(),
                "UNIFICAR",
                anterior,
                beneficiarioService.consultar(origen.getId()),
                dto.getMotivo());
        auditoriaService.registrar(
                "Beneficiario",
                destino.getId(),
                "RECIBIR_UNIFICACION",
                null,
                Map.of("idOrigen", origen.getId()),
                dto.getMotivo());
        log.info(
                "Beneficiarios unificados, origen={}, destino={}", origen.getId(), destino.getId());
        return beneficiarioService.consultar(destino.getId());
    }
}
