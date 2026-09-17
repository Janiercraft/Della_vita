package com.proyecto.config;

import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.ImportacionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CargaInicialDatos implements ApplicationRunner {

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Autowired
    private ImportacionService importacionService;

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("INICIO CargaInicialDatos");
        if (beneficiarioRepository.count() == 0) {
            System.out.println("Base vacia: importando Base_Beneficiarios_Hackathon");
            log.info("Base vacia: importando Base_Beneficiarios_Hackathon");
            importacionService.importarBaseHackathon();
        } else {
            System.out.println("OK CargaInicialDatos: ya existen beneficiarios, no se importa de nuevo");
            log.info("Ya existen beneficiarios, no se importa de nuevo");
        }
    }
}
