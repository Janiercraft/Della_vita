package com.proyecto.service;

import com.proyecto.dto.*;

import org.springframework.data.domain.Page;

public interface BeneficiarioService {
    BeneficiarioDto guardar(BeneficiarioDto dto);

    BeneficiarioDto editar(Long id, BeneficiarioDto dto);

    BeneficiarioDto cambiarEstado(Long id, EstadoDto dto);

    BeneficiarioDto cambiarConsentimiento(Long id, ConsentimientoDto dto);

    BeneficiarioDto consultar(Long id);

    Page<BeneficiarioDto> listar(
            String nombre, String documento, Boolean activo, int pagina, int tamanio);
}
