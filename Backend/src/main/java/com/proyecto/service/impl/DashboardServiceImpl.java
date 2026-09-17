package com.proyecto.service.impl;

import module java.base;

import com.proyecto.dto.ConteoDTO;
import com.proyecto.dto.DashboardDTO;
import com.proyecto.repository.AtencionRepository;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.DashboardService;
import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Autowired
    private AtencionRepository atencionRepository;

    @Override
    public DashboardDTO consultarResumen() {
        System.out.println("INICIO consultarDashboard");
        log.info("INICIO consultarDashboard");

        DashboardDTO dashboard = DashboardDTO.builder()
                .totalBeneficiarios(beneficiarioRepository.count())
                .totalAtenciones(atencionRepository.count())
                .pendientes(atencionRepository.countByEstado(MensajesCTE.ESTADO_PENDIENTE))
                .atendidos(atencionRepository.countByEstado(MensajesCTE.ESTADO_ATENDIDO))
                .enSeguimiento(atencionRepository.countByEstado(MensajesCTE.ESTADO_EN_SEGUIMIENTO))
                .finalizados(atencionRepository.countByEstado(MensajesCTE.ESTADO_FINALIZADO))
                .porMunicipio(convertirConteos(beneficiarioRepository.contarPorMunicipio()))
                .porZona(convertirConteos(beneficiarioRepository.contarPorZona()))
                .porOrganizacion(convertirConteos(beneficiarioRepository.contarPorOrganizacion()))
                .porTipoPoblacion(convertirConteos(beneficiarioRepository.contarPorTipoPoblacion()))
                .porNacionalidad(convertirConteos(beneficiarioRepository.contarPorNacionalidad()))
                .porResultado(convertirConteos(atencionRepository.contarPorResultado()))
                .porActividad(convertirConteos(atencionRepository.contarPorActividad()))
                .porEstado(convertirConteos(atencionRepository.contarPorEstado()))
                .mensaje(MensajesCTE.DASHBOARD_GENERADO)
                .build();

        System.out.println("OK consultarDashboard: beneficiarios=" + dashboard.getTotalBeneficiarios()
                + " atenciones=" + dashboard.getTotalAtenciones());
        log.info("OK consultarDashboard beneficiarios={} atenciones={}",
                dashboard.getTotalBeneficiarios(), dashboard.getTotalAtenciones());
        return dashboard;
    }

    private List<ConteoDTO> convertirConteos(List<Object[]> filas) {
        List<ConteoDTO> lista = new ArrayList<>();
        for (Object[] fila : filas) {
            String etiqueta = fila[0] == null ? "Sin dato" : String.valueOf(fila[0]);
            Long cantidad = fila[1] == null ? 0L : ((Number) fila[1]).longValue();
            lista.add(ConteoDTO.builder().etiqueta(etiqueta).cantidad(cantidad).build());
        }
        return lista;
    }
}
