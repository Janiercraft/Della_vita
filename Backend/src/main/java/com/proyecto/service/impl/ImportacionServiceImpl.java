package com.proyecto.service.impl;

import module java.base;

import com.proyecto.dto.ActividadDTO;
import com.proyecto.dto.ArchivoDTO;
import com.proyecto.dto.BeneficiarioDTO;
import com.proyecto.exception.ExcepcionDellaVita;
import com.proyecto.model.Actividad;
import com.proyecto.model.Atencion;
import com.proyecto.model.Beneficiario;
import com.proyecto.repository.ActividadRepository;
import com.proyecto.repository.AtencionRepository;
import com.proyecto.repository.BeneficiarioRepository;
import com.proyecto.service.ImportacionService;
import com.proyecto.util.MensajesCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class ImportacionServiceImpl implements ImportacionService {

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Autowired
    private ActividadRepository actividadRepository;

    @Autowired
    private AtencionRepository atencionRepository;

    private String limpiar(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.trim();
    }

    private Integer parseEntero(String valor) {
        String limpio = limpiar(valor);
        if (limpio.isBlank()) {
            return null;
        }
        return Integer.valueOf(limpio);
    }

    private Date parseFecha(String valor) {
        String limpio = limpiar(valor);
        if (limpio.isBlank()) {
            return null;
        }
        try {
            return java.sql.Date.valueOf(limpio);
        } catch (Exception excepcion) {
            return null;
        }
    }

    private String descripcionResultado(String resultado) {
        if ("R1".equals(resultado)) {
            return "Actividades asociadas al Resultado de la linea 1";
        }
        if ("R2".equals(resultado)) {
            return "Actividades asociadas al Resultado de la linea 2";
        }
        if ("R3".equals(resultado)) {
            return "Actividades asociadas al Resultado de la linea 3";
        }
        return resultado;
    }


   @Transactional
    @Override
    public BeneficiarioDTO importarBaseHackathon(ArchivoDTO archivoCsv) {
       log.info("INICIO importarBaseHackathon desde JSON");

       // Ahora actividadDTO sí existe porque viene por parámetro
       if (archivoCsv == null || archivoCsv.getContenidoBase64() == null || archivoCsv.getContenidoBase64().isBlank()) {
           throw new ExcepcionDellaVita(MensajesCTE.COD0099, HttpStatus.BAD_REQUEST,
                   "El contenido Base64 está vacío o no fue enviado correctamente.");
       }

       int beneficiariosImportados = 0;
       int atencionesImportadas = 0;

       try {
           // 1. Decodificar el String Base64 a un arreglo de bytes
           byte[] bytesCsv = Base64.getDecoder().decode(archivoCsv.getContenidoBase64());

           // 2. Convertir los bytes en un InputStream
           ByteArrayInputStream inputStream = new ByteArrayInputStream(bytesCsv);

           // 3. Leer el InputStream línea por línea
           try (BufferedReader lector = new BufferedReader(
                   new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

               String linea;
               boolean primeraLinea = true;

               while ((linea = lector.readLine()) != null) {
                   if (primeraLinea) {
                       primeraLinea = false;
                       continue; // Saltar cabecera
                   }

                   if (linea.isBlank()) {
                       continue;
                   }

                   String[] columnas = linea.split("[,;]", -1);
                   if (columnas.length < 18) {
                       log.warn("Fila incompleta ignorada: {}", linea);
                       continue;
                   }

                   // Limpieza y parseo de datos
                   String codigoBeneficiario = limpiar(columnas[0]);
                   String tipoDocumento = limpiar(columnas[1]);
                   String numeroDocumento = limpiar(columnas[2]);
                   String nombreCompleto = limpiar(columnas[3]);
                   String sexo = limpiar(columnas[4]);
                   Integer edad = parseEntero(columnas[5]);
                   String municipio = limpiar(columnas[6]);
                   String zona = limpiar(columnas[7]);
                   String nacionalidad = limpiar(columnas[8]);
                   String tipoPoblacion = limpiar(columnas[9]);
                   String organizacion = limpiar(columnas[10]);
                   Date fechaRegistro = parseFecha(columnas[11]);
                   String nombreActividad = limpiar(columnas[12]);
                   String resultadoAsociado = limpiar(columnas[13]);
                   Date fechaAtencion = parseFecha(columnas[14]);
                   String tipoAtencionAyuda = limpiar(columnas[15]);
                   String estado = limpiar(columnas[16]);
                   String observaciones = limpiar(columnas[17]);

                   // Prevención de duplicados para Beneficiario
                   Beneficiario beneficiario = beneficiarioRepository.findByCodigoBeneficiario(codigoBeneficiario);
                   if (beneficiario == null) {
                       beneficiario = new Beneficiario();
                       beneficiario.setCodigoBeneficiario(codigoBeneficiario);
                       beneficiario.setTipoDocumento(tipoDocumento);
                       beneficiario.setNumeroDocumento(numeroDocumento.isBlank() ? null : numeroDocumento);
                       beneficiario.setNombreCompleto(nombreCompleto);
                       beneficiario.setSexo(sexo);
                       beneficiario.setEdad(edad);
                       beneficiario.setMunicipio(municipio);
                       beneficiario.setZona(zona);
                       beneficiario.setNacionalidad(nacionalidad);
                       beneficiario.setTipoPoblacion(tipoPoblacion);
                       beneficiario.setOrganizacion(organizacion);
                       beneficiario.setFechaRegistro(fechaRegistro);
                       beneficiario.setActivo(MensajesCTE.ACTIVO);
                       beneficiario.setDtCreacion(new Date());
                       beneficiario.setUsuarioCreacion("importacion-json");
                       beneficiarioRepository.save(beneficiario);
                       beneficiariosImportados++;
                   }

                   // Prevención de duplicados para Actividad
                   Actividad actividad = actividadRepository.findByNombreActividad(nombreActividad);
                   if (actividad == null) {
                       actividad = new Actividad();
                       actividad.setNombreActividad(nombreActividad);
                       actividad.setResultadoAsociado(resultadoAsociado);
                       actividad.setDescripcionResultado(descripcionResultado(resultadoAsociado));
                       actividad.setActivo(MensajesCTE.ACTIVO);
                       actividad.setDtCreacion(new Date());
                       actividad.setUsuarioCreacion("importacion-json");
                       actividadRepository.save(actividad);
                   }

                   // Creación de la Atención (Relacionando Beneficiario y Actividad)
                   Atencion atencion = new Atencion();
                   atencion.setBeneficiario(beneficiario);
                   atencion.setActividad(actividad);
                   atencion.setFechaAtencion(fechaAtencion);
                   atencion.setTipoAtencionAyuda(tipoAtencionAyuda);
                   atencion.setEstado(estado);
                   atencion.setObservaciones(observaciones);
                   atencion.setDtCreacion(new Date());
                   atencion.setUsuarioCreacion("importacion-json");
                   atencionRepository.save(atencion);
                   atencionesImportadas++;
               }
           }
       } catch (IllegalArgumentException e) {
           log.error("Error decodificando Base64", e);
           throw new ExcepcionDellaVita(MensajesCTE.COD0099, HttpStatus.BAD_REQUEST,
                   "El contenido no es un Base64 válido.");
       } catch (Exception excepcion) {
           log.error("Error procesando la importación del CSV", excepcion);
           throw new ExcepcionDellaVita(MensajesCTE.COD0099, HttpStatus.INTERNAL_SERVER_ERROR,
                   "No se pudo importar el archivo: " + excepcion.getMessage());
       }

       log.info("OK importarBaseHackathon beneficiarios={} atenciones={}", beneficiariosImportados, atencionesImportadas);

       return BeneficiarioDTO.builder()
               .mensaje(MensajesCTE.IMPORTADO_CORRECTAMENTE
                       + ". Beneficiarios nuevos: " + beneficiariosImportados
                       + ". Atenciones registradas: " + atencionesImportadas)
               .build();
   }
    }

