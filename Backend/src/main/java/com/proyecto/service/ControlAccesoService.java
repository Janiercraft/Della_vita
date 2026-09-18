package com.proyecto.service;

import com.proyecto.model.Usuario;

public interface ControlAccesoService {
    Usuario usuarioActual();

    boolean esAdmin();

    boolean esOperador();

    String municipioAsignado();

    void validarMunicipio(String municipio);

    void validarBeneficiario(Long idBeneficiario);

    void validarParticipacion(Long idParticipacion);
}
