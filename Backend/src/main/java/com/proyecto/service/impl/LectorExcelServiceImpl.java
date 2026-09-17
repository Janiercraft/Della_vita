package com.proyecto.service.impl;

import com.proyecto.dto.ConfiguracionImportacionDto;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.service.LectorArchivoService;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;

@Service
public class LectorExcelServiceImpl implements LectorArchivoService {
    @Value("${application.importacion.max-filas}")
    private int maxFilas;

    @Override
    public boolean soporta(String nombre) {
        String minusculas = nombre.toLowerCase(Locale.ROOT);
        return minusculas.endsWith(".xlsx") || minusculas.endsWith(".xls");
    }

    @Override
    public List<Map<String, String>> leer(
            byte[] contenido, ConfiguracionImportacionDto configuracion) {
        try (Workbook libro = WorkbookFactory.create(new ByteArrayInputStream(contenido))) {
            if (configuracion.getHoja() >= libro.getNumberOfSheets()) {
                throw ExcepcionNegocio.invalido("La hoja seleccionada no existe");
            }
            Sheet hoja = libro.getSheetAt(configuracion.getHoja());
            if (hoja.getLastRowNum() > maxFilas) {
                throw ExcepcionNegocio.invalido("El archivo supera " + maxFilas + " filas");
            }
            Row cabecera = hoja.getRow(0);
            if (cabecera == null
                    || cabecera.getLastCellNum() < 1
                    || cabecera.getLastCellNum() > 200) {
                throw ExcepcionNegocio.invalido("Encabezados ausentes o mas de 200 columnas");
            }
            DataFormatter formato = new DataFormatter(Locale.ROOT);
            List<String> encabezados = new ArrayList<>();
            for (int columna = 0; columna < cabecera.getLastCellNum(); columna++) {
                encabezados.add(formato.formatCellValue(cabecera.getCell(columna)));
            }
            LectorCsvServiceImpl.validarEncabezados(encabezados, configuracion);
            List<Map<String, String>> filas = new ArrayList<>();
            for (int numero = 1; numero <= hoja.getLastRowNum(); numero++) {
                Row registro = hoja.getRow(numero);
                Map<String, String> fila = new LinkedHashMap<>();
                for (int columna = 0; columna < encabezados.size(); columna++) {
                    Cell celda = registro == null ? null : registro.getCell(columna);
                    String valor = formato.formatCellValue(celda);
                    if (celda != null && celda.getCellType() == CellType.FORMULA) {
                        fila.put(
                                "__error",
                                "No se admiten formulas; exporte sus valores antes de importar");
                    }
                    if (celda != null && celda.getCellType() == CellType.ERROR) {
                        fila.put("__error", "La fila contiene una celda con error de Excel");
                    }
                    if (celda != null
                            && celda.getCellType() == CellType.NUMERIC
                            && DateUtil.isCellDateFormatted(celda)) {
                        valor = celda.getLocalDateTimeCellValue().toLocalDate().toString();
                    }
                    fila.put(encabezados.get(columna), valor);
                }
                filas.add(fila);
            }
            return filas;
        } catch (ExcepcionNegocio error) {
            throw error;
        } catch (Exception error) {
            throw ExcepcionNegocio.invalido(
                    "Excel invalido o protegido; use un archivo XLSX o XLS legible");
        }
    }
}
