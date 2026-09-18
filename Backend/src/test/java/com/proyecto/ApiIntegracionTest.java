package com.proyecto;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import com.proyecto.dto.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

/** Ejecutar sobre una base PostgreSQL VACIA de pruebas; nunca sobre datos reales. */
@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.annotation.DirtiesContext(
        classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@EnabledIfEnvironmentVariable(named = "TEST_DB_URL", matches = ".+")
class ApiIntegracionTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired BeneficiarioService beneficiarioService;
    @Autowired ProgramaService programaService;
    @Autowired ParticipacionService participacionService;
    @Autowired AtencionService atencionService;
    @Autowired SeguimientoService seguimientoService;
    @Autowired FamiliaService familiaService;
    @Autowired IntegranteFamiliaService integranteFamiliaService;
    @Autowired CatalogoService catalogoService;
    @Autowired UnificacionService unificacionService;
    @Autowired ConsultaService consultaService;
    @Autowired UsuarioService usuarioService;
    @Autowired ImportacionService importacionService;
    @Autowired FilaImportacionRepository filaRepository;
    @Autowired BeneficiarioRepository beneficiarioRepository;
    @Autowired AuditoriaRepository auditoriaRepository;
    @Autowired UsuarioRepository usuarioRepository;

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", () -> System.getenv("TEST_DB_URL"));
        registro.add(
                "spring.datasource.username",
                () -> System.getenv().getOrDefault("TEST_DB_USER", "pruebas"));
        registro.add(
                "spring.datasource.password",
                () -> System.getenv().getOrDefault("TEST_DB_PASSWORD", ""));
        registro.add("application.admin.usuario", () -> "admin_pruebas");
        registro.add("application.admin.clave", () -> "ClaveTemporalSoloPruebas123!");
    }

    String unico() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    BeneficiarioDto persona(String nombre, String documento) {
        return BeneficiarioDto.builder()
                .primerNombre(nombre)
                .primerApellido("Pruebas")
                .tipoDocumento(documento == null ? null : "CC")
                .numeroDocumento(documento)
                .build();
    }

    ConfiguracionImportacionDto configuracion() {
        return ConfiguracionImportacionDto.builder()
                .mapeo(
                        Map.of(
                                "primerNombre",
                                "nombre",
                                "primerApellido",
                                "apellido",
                                "tipoDocumento",
                                "tipo",
                                "numeroDocumento",
                                "documento"))
                .build();
    }

    ImportacionDto cargar(String filas) {
        MockMultipartFile archivo =
                new MockMultipartFile(
                        "archivo",
                        "pruebas.csv",
                        "text/csv",
                        ("nombre,apellido,tipo,documento\n" + filas)
                                .getBytes(StandardCharsets.UTF_8));
        return importacionService.cargar(archivo, configuracion(), true);
    }

    @Test
    void exigeAutenticacion() throws Exception {
        mvc.perform(get("/api/v1/beneficiarios"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    @Test
    void consultaNoPuedeCrear() throws Exception {
        mvc.perform(
                        post("/api/v1/beneficiarios")
                                .with(user("lector").roles("CONSULTA"))
                                .header("X-Requested-With", "gestion-beneficiarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsBytes(persona(unico(), null))))
                .andExpect(status().isForbidden());
    }

    @Test
    void exigeEncabezadoParaMutaciones() throws Exception {
        mvc.perform(
                        post("/api/v1/beneficiarios")
                                .with(user("admin").roles("ADMIN"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsBytes(persona(unico(), null))))
                .andExpect(status().isForbidden());
    }

    @Test
    void informaCamposFaltantes() throws Exception {
        mvc.perform(
                        post("/api/v1/beneficiarios")
                                .with(user("operador").roles("OPERADOR"))
                                .header("X-Requested-With", "gestion-beneficiarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.datos.primerNombre").exists());
    }

    @Test
    void registraSinDocumentoYBuscaNombreNormalizado() throws Exception {
        String nombre = "María" + unico();
        BeneficiarioDto guardado = beneficiarioService.guardar(persona(nombre, null));
        assertThat(guardado.getCodigoInterno()).startsWith("BEN-");
        mvc.perform(
                        get("/api/v1/beneficiarios")
                                .param("nombre", "Maria" + nombre.substring(5))
                                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.totalElements").value(1));
    }

    @Test
    void rechazaDocumentoRepetido() {
        String documento = unico();
        beneficiarioService.guardar(persona(unico(), documento));
        assertThatThrownBy(() -> beneficiarioService.guardar(persona(unico(), documento)))
                .hasMessageContaining("Ya existe");
    }

    @Test
    void actualizaConVersionYRechazaVersionAnterior() {
        BeneficiarioDto guardado = beneficiarioService.guardar(persona(unico(), null));
        Long versionOriginal = guardado.getVersion();
        guardado.setCelular("3001234567");
        BeneficiarioDto actualizado = beneficiarioService.editar(guardado.getId(), guardado);
        assertThat(actualizado.getVersion()).isGreaterThan(versionOriginal);
        assertThatThrownBy(() -> beneficiarioService.editar(guardado.getId(), guardado))
                .hasMessageContaining("modificado");
        assertThat(
                        auditoriaRepository
                                .findByEntidadAndIdRegistro(
                                        "Beneficiario",
                                        guardado.getId(),
                                        org.springframework.data.domain.PageRequest.of(0, 20))
                                .getTotalElements())
                .isEqualTo(2);
    }

    @Test
    void desactivaSinBorrarHistorial() {
        BeneficiarioDto guardado = beneficiarioService.guardar(persona(unico(), null));
        beneficiarioService.cambiarEstado(
                guardado.getId(),
                EstadoDto.builder()
                        .activo(false)
                        .version(guardado.getVersion())
                        .motivo("Solicitud del usuario")
                        .build());
        assertThat(beneficiarioService.consultar(guardado.getId()).getActivo()).isFalse();
    }

    @Test
    void validaRelacionesYParticipacionUnicaPorPeriodo() {
        BeneficiarioDto persona = beneficiarioService.guardar(persona(unico(), null));
        ProgramaDto programa =
                programaService.guardar(ProgramaDto.builder().nombre(unico()).build());
        ParticipacionDto solicitud =
                ParticipacionDto.builder()
                        .idBeneficiario(persona.getId())
                        .idPrograma(programa.getId())
                        .periodo("2026")
                        .fechaIngreso(LocalDate.now())
                        .build();
        participacionService.guardar(solicitud);
        assertThatThrownBy(() -> participacionService.guardar(solicitud))
                .hasMessageContaining("Ya existe");
        solicitud.setPeriodo("2027");
        assertThat(participacionService.guardar(solicitud).getId()).isNotNull();
        solicitud.setIdBeneficiario(Long.MAX_VALUE);
        assertThatThrownBy(() -> participacionService.guardar(solicitud))
                .hasMessageContaining("no encontrado");
    }

    @Test
    void reintentoDeAtencionNoDuplicaYDetectaCambioDeContenido() {
        BeneficiarioDto persona = beneficiarioService.guardar(persona(unico(), null));
        ProgramaDto programa =
                programaService.guardar(ProgramaDto.builder().nombre(unico()).build());
        ParticipacionDto participacion =
                participacionService.guardar(
                        ParticipacionDto.builder()
                                .idBeneficiario(persona.getId())
                                .idPrograma(programa.getId())
                                .periodo("2026")
                                .fechaIngreso(LocalDate.now())
                                .build());
        AtencionDto solicitud =
                AtencionDto.builder()
                        .idParticipacion(participacion.getId())
                        .tipoAtencion("Orientacion")
                        .fechaAtencion(LocalDate.now())
                        .build();
        String clave = unico();
        Long id = atencionService.guardar(solicitud, clave).getId();
        assertThat(atencionService.guardar(solicitud, clave).getId()).isEqualTo(id);
        solicitud.setTipoAtencion("Entrega");
        assertThatThrownBy(() -> atencionService.guardar(solicitud, clave))
                .hasMessageContaining("otros datos");
    }

    @Test
    void importaValidosYReportaDuplicadosYErrores() {
        String nombre = unico();
        String documento = unico();
        String filas =
                nombre
                        + ",Pruebas,CC,"
                        + documento
                        + "\n"
                        + nombre
                        + ",Pruebas,CC,"
                        + documento
                        + "\n,Pruebas,,\n";
        ImportacionDto resultado = cargar(filas);
        assertThat(resultado.getResultados())
                .containsEntry("IMPORTADO", 1L)
                .containsEntry("DUPLICADO", 1L)
                .containsEntry("ERROR", 1L);
        String reporte =
                new String(
                        importacionService.reporte(resultado.getId(), true),
                        StandardCharsets.UTF_8);
        assertThat(reporte)
                .contains("DUPLICADO")
                .doesNotContain("Beneficiario creado correctamente");
        assertThat(cargar(filas).getId()).isEqualTo(resultado.getId());
    }

    @Test
    void detectaDuplicadosContraBaseExistente() {
        String nombre = unico();
        String documento = unico();
        beneficiarioService.guardar(persona(nombre, documento));
        ImportacionDto resultado =
                cargar(
                        nombre
                                + ",Pruebas,CC,"
                                + documento
                                + "\n"
                                + unico()
                                + ",Pruebas,CC,"
                                + unico()
                                + "\n");
        assertThat(resultado.getResultados())
                .containsEntry("IMPORTADO", 1L)
                .containsEntry("DUPLICADO", 1L);
    }

    @Test
    void documentoContradictorioQuedaPendiente() {
        String documento = unico();
        beneficiarioService.guardar(persona(unico(), documento));
        ImportacionDto resultado = cargar(unico() + ",Pruebas,CC," + documento + "\n");
        assertThat(resultado.getResultados())
                .containsEntry("PENDIENTE", 1L)
                .containsEntry("IMPORTADO", 0L);
    }

    @Test
    void homonimosSinDocumentoRequierenDecision() {
        String nombre = unico();
        ImportacionDto resultado = cargar(nombre + ",Pruebas,,\n" + nombre + ",Pruebas,,\n");
        assertThat(resultado.getResultados())
                .containsEntry("IMPORTADO", 1L)
                .containsEntry("PENDIENTE", 1L);
        Long idFila =
                filaRepository
                        .findByIdImportacionOrderByNumeroFila(resultado.getId())
                        .get(1)
                        .getId();
        resultado =
                importacionService.resolver(
                        resultado.getId(),
                        idFila,
                        ResolverFilaDto.builder()
                                .accion("CREAR")
                                .motivo("Se verifico que son dos personas diferentes")
                                .build());
        assertThat(resultado.getResultados())
                .containsEntry("IMPORTADO", 2L)
                .containsEntry("PENDIENTE", 0L);
    }

    @Test
    void unNombreParecidoNoSeDescartaAutomaticamente() {
        String nombre = unico();
        beneficiarioService.guardar(persona(nombre, null));
        ImportacionDto resultado = cargar(nombre + "a,Pruebas,,\n");
        assertThat(resultado.getResultados()).containsEntry("PENDIENTE", 1L);
    }

    @Test
    void procesaExcelYConservaDocumentoComoTexto() throws Exception {
        byte[] contenido;
        String documento = "00" + unico();
        try (XSSFWorkbook libro = new XSSFWorkbook();
                ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            var hoja = libro.createSheet("Beneficiarios");
            var encabezado = hoja.createRow(0);
            String[] columnas = {"nombre", "apellido", "tipo", "documento"};
            for (int i = 0; i < columnas.length; i++) {
                encabezado.createCell(i).setCellValue(columnas[i]);
            }
            var fila = hoja.createRow(1);
            fila.createCell(0).setCellValue(unico());
            fila.createCell(1).setCellValue("Pruebas");
            fila.createCell(2).setCellValue("CC");
            fila.createCell(3).setCellValue(documento);
            libro.write(salida);
            contenido = salida.toByteArray();
        }
        MockMultipartFile archivo =
                new MockMultipartFile(
                        "archivo",
                        "pruebas.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        contenido);
        ImportacionDto resultado = importacionService.cargar(archivo, configuracion(), true);
        assertThat(resultado.getResultados()).containsEntry("IMPORTADO", 1L);
        assertThat(
                        beneficiarioRepository.findByTipoDocumentoAndNumeroDocumento(
                                "CC", documento.toUpperCase(Locale.ROOT)))
                .isPresent();
    }

    @Test
    void rechazaFormatoNoSoportado() {
        MockMultipartFile archivo =
                new MockMultipartFile(
                        "archivo",
                        "datos.sql",
                        "text/plain",
                        "select 1".getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> importacionService.cargar(archivo, configuracion(), true))
                .hasMessageContaining("Formato no soportado");
    }

    @Test
    void permitePrepararYConfirmarSinDuplicar() {
        MockMultipartFile archivo =
                new MockMultipartFile(
                        "archivo",
                        "datos.csv",
                        "text/csv",
                        ("nombre,apellido,tipo,documento\n" + unico() + ",Pruebas,,\n")
                                .getBytes(StandardCharsets.UTF_8));
        ImportacionDto preparado = importacionService.cargar(archivo, configuracion(), false);
        assertThat(preparado.getResultados())
                .containsEntry("NUEVO", 1L)
                .containsEntry("IMPORTADO", 0L);
        assertThat(importacionService.confirmar(preparado.getId()).getResultados())
                .containsEntry("IMPORTADO", 1L);
        assertThat(importacionService.confirmar(preparado.getId()).getResultados())
                .containsEntry("IMPORTADO", 1L);
    }

    @Test
    void llamadasConcurrentesAlMismoLoteNoDuplican() throws Exception {
        String filas = unico() + ",Pruebas,CC," + unico() + "\n";
        try (ExecutorService ejecutor = Executors.newFixedThreadPool(2)) {
            Future<ImportacionDto> primero = ejecutor.submit(() -> cargar(filas));
            Future<ImportacionDto> segundo = ejecutor.submit(() -> cargar(filas));
            ImportacionDto resultado = primero.get(30, TimeUnit.SECONDS);
            assertThat(segundo.get(30, TimeUnit.SECONDS).getId()).isEqualTo(resultado.getId());
            assertThat(importacionService.consultar(resultado.getId()).getResultados())
                    .containsEntry("IMPORTADO", 1L);
        }
    }

    @Test
    void contrasenasNoAparecenEnRespuestaNiAuditoria() throws Exception {
        String nombre = "usuario" + unico();
        String respuesta =
                mvc.perform(
                                post("/api/v1/usuarios")
                                        .with(user("admin").roles("ADMIN"))
                                        .header("X-Requested-With", "gestion-beneficiarios")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                "{\"nombreUsuario\":\""
                                                        + nombre
                                                        + "\",\"nombreCompleto\":\"Usuario de"
                                                        + " prueba\",\"clave\":\"ClavePruebaSegura123\",\"rol\":\"CONSULTA\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();
        assertThat(respuesta).doesNotContain("clave", "ClavePruebaSegura123");
        Long id = mapper.readTree(respuesta).path("datos").path("id").asLong();
        assertThat(
                        auditoriaRepository
                                .findByEntidadAndIdRegistro(
                                        "Usuario",
                                        id,
                                        org.springframework.data.domain.PageRequest.of(0, 20))
                                .getContent()
                                .getFirst()
                                .getDetalle())
                .doesNotContain("ClavePruebaSegura123", "clave");
    }

    @Test
    void autenticacionBasicFunciona() throws Exception {
        mvc.perform(
                        get("/api/v1/beneficiarios")
                                .with(httpBasic("admin_pruebas", "ClaveTemporalSoloPruebas123!")))
                .andExpect(status().isOk());
    }

    @Test
    void contratoOpenApiDisponible() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/importaciones']").exists());
    }

    @Test
    void administraFamiliaIntegrantesYCatalogos() {
        FamiliaDto familia = familiaService.guardar(FamiliaDto.builder().nombre(unico()).build());
        familia.setMunicipio("Bogota");
        familia = familiaService.editar(familia.getId(), familia);
        assertThat(familiaService.consultar(familia.getId()).getMunicipio()).isEqualTo("Bogota");
        BeneficiarioDto persona = beneficiarioService.guardar(persona(unico(), null));
        IntegranteFamiliaDto solicitud =
                IntegranteFamiliaDto.builder()
                        .idFamilia(familia.getId())
                        .idBeneficiario(persona.getId())
                        .parentesco("HIJO")
                        .build();
        IntegranteFamiliaDto integrante = integranteFamiliaService.guardar(solicitud);
        assertThatThrownBy(() -> integranteFamiliaService.guardar(solicitud))
                .hasMessageContaining("Ya existe");
        integrante.setParentesco("HIJA");
        integrante = integranteFamiliaService.editar(integrante.getId(), integrante);
        integranteFamiliaService.cambiarEstado(
                integrante.getId(),
                EstadoDto.builder()
                        .activo(false)
                        .version(integrante.getVersion())
                        .motivo("Retiro de familia")
                        .build());
        assertThat(integranteFamiliaService.consultar(integrante.getId()).getActivo()).isFalse();
        CatalogoDto catalogo =
                catalogoService.guardar(
                        CatalogoDto.builder()
                                .tipo("PRUEBA")
                                .codigo(unico())
                                .nombre("Inicial")
                                .build());
        catalogo.setNombre("Actualizado");
        catalogo = catalogoService.editar(catalogo.getId(), catalogo);
        assertThat(catalogo.getNombre()).isEqualTo("Actualizado");
        catalogoService.cambiarEstado(
                catalogo.getId(),
                EstadoDto.builder()
                        .activo(false)
                        .version(catalogo.getVersion())
                        .motivo("Fin del catalogo")
                        .build());
        assertThat(catalogoService.consultar(catalogo.getId()).getActivo()).isFalse();
    }

    @Test
    void seguimientoYUnificacionConservanHistorial() {
        BeneficiarioDto origen = beneficiarioService.guardar(persona(unico(), null));
        BeneficiarioDto destino = beneficiarioService.guardar(persona(unico(), null));
        ProgramaDto programa =
                programaService.guardar(ProgramaDto.builder().nombre(unico()).build());
        ParticipacionDto participacion =
                participacionService.guardar(
                        ParticipacionDto.builder()
                                .idBeneficiario(origen.getId())
                                .idPrograma(programa.getId())
                                .periodo("2026")
                                .fechaIngreso(LocalDate.now())
                                .build());
        SeguimientoDto seguimiento =
                seguimientoService.guardar(
                        SeguimientoDto.builder()
                                .idParticipacion(participacion.getId())
                                .fechaSeguimiento(LocalDate.now())
                                .estadoSeguimiento("PENDIENTE")
                                .observaciones("Visita programada")
                                .build(),
                        unico());
        seguimiento.setEstadoSeguimiento("FINALIZADO");
        seguimientoService.editar(seguimiento.getId(), seguimiento);
        unificacionService.unificar(
                UnificacionDto.builder()
                        .idOrigen(origen.getId())
                        .idDestino(destino.getId())
                        .versionOrigen(origen.getVersion())
                        .versionDestino(destino.getVersion())
                        .motivo("Identidad verificada presencialmente")
                        .build());
        assertThat(beneficiarioService.consultar(origen.getId()).getIdBeneficiarioPrincipal())
                .isEqualTo(destino.getId());
        assertThat(
                        consultaService
                                .historial(destino.getId(), 0, 20)
                                .getSeguimientos()
                                .getTotalElements())
                .isEqualTo(1);
        assertThat(
                        consultaService
                                .historial(destino.getId(), 0, 20)
                                .getParticipaciones()
                                .getTotalElements())
                .isEqualTo(1);
        BeneficiarioDto alias = beneficiarioService.consultar(origen.getId());
        assertThatThrownBy(
                        () ->
                                beneficiarioService.cambiarEstado(
                                        alias.getId(),
                                        EstadoDto.builder()
                                                .activo(true)
                                                .version(alias.getVersion())
                                                .motivo("Reactivar")
                                                .build()))
                .hasMessageContaining("unificado");
    }

    @Test
    void noSePuedeEliminarElUltimoAdministrador() {
        var administrador = usuarioRepository.findByNombreUsuario("admin_pruebas").orElseThrow();
        assertThatThrownBy(
                        () ->
                                usuarioService.cambiarEstado(
                                        administrador.getId(),
                                        EstadoDto.builder()
                                                .activo(false)
                                                .version(administrador.getVersion())
                                                .motivo("Prueba")
                                                .build()))
                .hasMessageContaining("ultimo administrador");
    }

    @Test
    void auditoriaNoPermiteBorrado() {
        BeneficiarioDto persona = beneficiarioService.guardar(persona(unico(), null));
        var entrada =
                auditoriaRepository
                        .findByEntidadAndIdRegistro(
                                "Beneficiario",
                                persona.getId(),
                                org.springframework.data.domain.PageRequest.of(0, 20))
                        .getContent()
                        .getFirst();
        assertThatThrownBy(() -> auditoriaRepository.deleteById(entrada.getId()))
                .hasMessageContaining("historial de auditoria");
        assertThat(auditoriaRepository.findById(entrada.getId())).isPresent();
    }

    @Test
    void cargaMultipartPorHttp() throws Exception {
        MockMultipartFile archivo =
                new MockMultipartFile(
                        "archivo",
                        "http.csv",
                        "text/csv",
                        ("nombre,apellido,tipo,documento\n" + unico() + ",Pruebas,,\n")
                                .getBytes(StandardCharsets.UTF_8));
        MockMultipartFile configuracion =
                new MockMultipartFile(
                        "configuracion",
                        "",
                        "application/json",
                        mapper.writeValueAsBytes(configuracion()));
        mvc.perform(
                        multipart("/api/v1/importaciones")
                                .file(archivo)
                                .file(configuracion)
                                .with(user("admin").roles("ADMIN"))
                                .header("X-Requested-With", "gestion-beneficiarios"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.resultados.IMPORTADO").value(1));
    }

    @Test
    void metodoYRutaInvalidosDevuelvenEstadoCorrecto() throws Exception {
        mvc.perform(
                        delete("/api/v1/beneficiarios/1")
                                .with(user("admin").roles("ADMIN"))
                                .header("X-Requested-With", "gestion-beneficiarios"))
                .andExpect(status().isMethodNotAllowed());
        mvc.perform(get("/api/v1/no-existe").with(user("admin").roles("ADMIN")))
                .andExpect(status().isNotFound());
    }
}
