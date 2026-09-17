package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.Paginacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.csv.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportacionServiceImpl implements ImportacionService {
    private final PreparacionImportacionService preparacionService;
    private final ProcesamientoFilaService procesamientoService;
    private final ImportacionRepository importacionRepository;
    private final FilaImportacionRepository filaRepository;

    @Override
    public ImportacionDto cargar(
            MultipartFile archivo, ConfiguracionImportacionDto configuracion, boolean confirmar) {
        try {
            Long id =
                    preparacionService.preparar(
                            archivo.getOriginalFilename(), archivo.getBytes(), configuracion);
            if (confirmar) {
                return confirmar(id);
            }
            return consultar(id);
        } catch (IOException error) {
            throw ExcepcionNegocio.invalido("No se pudo leer el archivo");
        }
    }

    @Override
    public ImportacionDto confirmar(Long id) {
        obtener(id);
        List<Long> pendientes = filaRepository.consultarPendientesDeProcesar(id);
        for (Long idFila : pendientes) {
            try {
                procesamientoService.procesar(idFila);
            } catch (DataIntegrityViolationException error) {
                // Una alta manual simultanea puede haber registrado el mismo documento.
                try {
                    procesamientoService.procesar(idFila);
                } catch (ExcepcionNegocio segundoError) {
                    procesamientoService.marcarError(idFila, segundoError.getMessage());
                } catch (DataIntegrityViolationException segundoError) {
                    procesamientoService.marcarError(
                            idFila, "Conflicto de integridad al guardar la fila");
                }
            } catch (ExcepcionNegocio error) {
                procesamientoService.marcarError(idFila, error.getMessage());
            }
            // Un fallo de infraestructura interrumpe el lote; confirmar nuevamente reanuda solo
            // NUEVO.
        }
        log.info("Procesamiento de importacion finalizado, id={}", id);
        return consultar(id);
    }

    @Override
    public ImportacionDto consultar(Long id) {
        Importacion importacion = obtener(id);
        Map<String, Long> resultados = new LinkedHashMap<>();
        for (String estado :
                List.of(
                        "NUEVO",
                        "IMPORTADO",
                        "DUPLICADO",
                        "PENDIENTE",
                        "ERROR",
                        "OMITIDO",
                        "VINCULADO")) {
            resultados.put(estado, 0L);
        }
        for (Object[] conteo : filaRepository.contarResultados(id)) {
            resultados.put((String) conteo[0], (Long) conteo[1]);
        }
        String estado =
                resultados.get("NUEVO") > 0
                        ? "POR_PROCESAR"
                        : resultados.get("PENDIENTE") > 0 ? "REQUIERE_REVISION" : "FINALIZADA";
        return ImportacionDto.builder()
                .id(id)
                .nombreArchivo(importacion.getNombreArchivo())
                .fecha(importacion.getFecha())
                .estado(estado)
                .total(resultados.values().stream().mapToLong(Long::longValue).sum())
                .resultados(resultados)
                .build();
    }

    @Override
    public Page<ImportacionDto> listar(int pagina, int tamanio) {
        return importacionRepository
                .findAll(Paginacion.crear(pagina, tamanio))
                .map(importacion -> consultar(importacion.getId()));
    }

    @Override
    public Page<FilaImportacion> listarFilas(Long id, String estado, int pagina, int tamanio) {
        obtener(id);
        if (estado == null) {
            return filaRepository.findByIdImportacion(id, Paginacion.crear(pagina, tamanio));
        }
        if (!Set.of("NUEVO", "IMPORTADO", "DUPLICADO", "PENDIENTE", "ERROR", "OMITIDO", "VINCULADO")
                .contains(estado)) {
            throw ExcepcionNegocio.invalido("Estado de fila invalido");
        }
        return filaRepository.findByIdImportacionAndEstado(
                id, estado, Paginacion.crear(pagina, tamanio));
    }

    @Override
    public byte[] reporte(Long id, boolean soloDuplicados) {
        obtener(id);
        StringWriter salida = new StringWriter();
        try (CSVPrinter csv =
                new CSVPrinter(
                        salida,
                        CSVFormat.DEFAULT
                                .builder()
                                .setHeader(
                                        "fila",
                                        "estado",
                                        "motivo",
                                        "idBeneficiario",
                                        "candidatos",
                                        "datosOriginales",
                                        "datosNormalizados")
                                .get())) {
            for (FilaImportacion fila : filaRepository.findByIdImportacionOrderByNumeroFila(id)) {
                if (soloDuplicados
                        && !Set.of("DUPLICADO", "PENDIENTE", "VINCULADO")
                                .contains(fila.getEstado())) {
                    continue;
                }
                csv.printRecord(
                        fila.getNumeroFila(),
                        fila.getEstado(),
                        protegerCelda(fila.getMotivo()),
                        fila.getIdBeneficiario(),
                        protegerCelda(fila.getCandidatos()),
                        protegerCelda(fila.getOriginales()),
                        protegerCelda(fila.getNormalizados()));
            }
        } catch (IOException error) {
            throw new IllegalStateException("No fue posible generar el reporte");
        }
        return ("\uFEFF" + salida).getBytes(StandardCharsets.UTF_8);
    }

    private String protegerCelda(String valor) {
        if (valor == null) {
            return "";
        }
        String revision = valor.stripLeading();
        if (!revision.isEmpty() && "=+-@".indexOf(revision.charAt(0)) >= 0) {
            return "'" + valor;
        }
        return valor;
    }

    @Override
    public ImportacionDto resolver(Long id, Long idFila, ResolverFilaDto dto) {
        obtener(id);
        procesamientoService.resolver(id, idFila, dto);
        return consultar(id);
    }

    private Importacion obtener(Long id) {
        Optional<Importacion> importacion = importacionRepository.findById(id);
        if (importacion.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Importacion");
        }
        return importacion.get();
    }
}
