package com.proyecto.service;

import com.proyecto.dto.ArchivoDTO;
import com.proyecto.dto.BeneficiarioDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ImportacionService {

    BeneficiarioDTO importarBaseHackathon(ArchivoDTO archivoCsv);
}
