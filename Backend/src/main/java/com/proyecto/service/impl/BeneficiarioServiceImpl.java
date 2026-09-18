package com.proyecto.service.impl;

import com.proyecto.dto.*;
import com.proyecto.exception.ExcepcionNegocio;
import com.proyecto.model.*;
import com.proyecto.repository.*;
import com.proyecto.service.*;
import com.proyecto.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BeneficiarioServiceImpl implements BeneficiarioService {
    private final BeneficiarioRepository repository;
    private final AuditoriaService auditoriaService;
    private final ControlAccesoService controlAccesoService;
    private final FamiliaRepository familiaRepository;
    private final IntegranteFamiliaRepository integranteFamiliaRepository;

    @Override
    @Transactional
    public BeneficiarioDto guardar(BeneficiarioDto dto) {
        log.info("Iniciando registro de Beneficiario");

        validar(dto, null);
        controlAccesoService.validarMunicipio(dto.getMunicipio());
        Beneficiario registro = new Beneficiario();
        registro.setCodigoInterno("BEN-" + UUID.randomUUID());

        copiarCampos(dto, registro);
        registro.setEstadoConsentimiento("PENDIENTE");
        registro.setEstadoRevisionDuplicidad(determinarEstadoDuplicidad(dto));
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                registro.getId(),
                "CREAR",
                null,
                convertirADto(registro),
                "Registro creado");
        log.info("Beneficiario guardado, id={}", registro.getId());
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public BeneficiarioDto editar(Long id, BeneficiarioDto dto) {
        log.info("Editando Beneficiario, id={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());
        if (registro.getIdBeneficiarioPrincipal() != null) {
            throw ExcepcionNegocio.conflicto(
                    "Este registro fue unificado; utilice su beneficiario principal");
        }
        BeneficiarioDto anterior = convertirADto(registro);
        validar(dto, id);
        controlAccesoService.validarMunicipio(dto.getMunicipio());
        copiarCampos(dto, registro);
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                id,
                "EDITAR",
                anterior,
                convertirADto(registro),
                "Datos actualizados");
        return convertirADto(registro);
    }

    @Override
    @Transactional
    public BeneficiarioDto cambiarEstado(Long id, EstadoDto dto) {
        log.info("Cambiando estado de Beneficiario, id={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());
        if (registro.getIdBeneficiarioPrincipal() != null) {
            throw ExcepcionNegocio.conflicto(
                    "Este registro fue unificado; utilice su beneficiario principal");
        }
        BeneficiarioDto anterior = convertirADto(registro);
        registro.setActivo(dto.getActivo());
        repository.saveAndFlush(registro);
        auditoriaService.registrar(
                "Beneficiario",
                id,
                "CAMBIAR_ESTADO",
                anterior,
                convertirADto(registro),
                dto.getMotivo());
        return convertirADto(registro);
    }

    @Override
    public BeneficiarioDto consultar(Long id) {
        controlAccesoService.validarBeneficiario(id);
        return convertirADto(obtener(id));
    }

    @Override
    public Page<BeneficiarioDto> listar(
            String nombre, String documento, Boolean activo, int pagina, int tamanio) {
        String numeroDocumento = Normalizador.documento(documento);
        Page<Beneficiario> registros;
        if (controlAccesoService.esOperador()) {
            registros =
                    repository.buscarBeneficiariosPorMunicipio(
                            controlAccesoService.municipioAsignado(),
                            Normalizador.clave(nombre),
                            Objects.toString(numeroDocumento, ""),
                            activo,
                            Paginacion.crear(pagina, tamanio));
        } else {
            registros =
                    repository.buscarBeneficiarios(
                            Normalizador.clave(nombre),
                            Objects.toString(numeroDocumento, ""),
                            activo,
                            Paginacion.crear(pagina, tamanio));
        }
        return registros.map(this::convertirADto);
    }


    @Override
    @Transactional
    public BeneficiarioDto cambiarConsentimiento(Long id, ConsentimientoDto dto) {
        log.info("Actualizando consentimiento informado, beneficiarioId={}", id);
        Beneficiario registro = obtener(id);
        controlAccesoService.validarBeneficiario(id);
        comprobarVersion(registro, dto.getVersion());

        BeneficiarioDto anterior = convertirADto(registro);
        registro.setEstadoConsentimiento(dto.getEstado());
        repository.saveAndFlush(registro);

        auditoriaService.registrar(
                "Beneficiario",
                id,
                "CONSENTIMIENTO",
                anterior,
                convertirADto(registro),
                Objects.toString(dto.getMotivo(), "Cambio de consentimiento informado"));
        return convertirADto(registro);
    }

    private String determinarEstadoDuplicidad(BeneficiarioDto dto) {
        if (!controlAccesoService.esOperador()) {
            return "APROBADO";
        }
        if (dto.getNumeroDocumento() != null || dto.getFechaNacimiento() == null) {
            return "APROBADO";
        }

        String nombreCompleto =
                String.join(
                        " ",
                        dto.getPrimerNombre(),
                        Objects.toString(dto.getSegundoNombre(), ""),
                        dto.getPrimerApellido(),
                        Objects.toString(dto.getSegundoApellido(), ""));
        String nombreNormalizado = Normalizador.clave(nombreCompleto);

        boolean coincidencia =
                repository.findByNombreNormalizadoAndFechaNacimientoOrderById(
                                nombreNormalizado, dto.getFechaNacimiento())
                        .stream()
                        .anyMatch(b -> b.getIdBeneficiarioPrincipal() == null);

        if (coincidencia) {
            log.warn(
                    "Posible duplicado sin documento detectado; registro quedara EN_REVISION_DUPLICIDAD");
            return "EN_REVISION_DUPLICIDAD";
        }
        return "APROBADO";
    }

    private Beneficiario obtener(Long id) {
        Optional<Beneficiario> registro = repository.findById(id);
        if (registro.isEmpty()) {
            throw ExcepcionNegocio.noEncontrado("Beneficiario");
        }
        return registro.get();
    }

    private void comprobarVersion(Beneficiario registro, Long version) {
        if (version == null) {
            throw ExcepcionNegocio.invalido("Falta version del registro consultado");
        }
        if (!registro.getVersion().equals(version)) {
            throw ExcepcionNegocio.conflicto(
                    "El registro fue modificado por otro usuario; consulte nuevamente");
        }
    }

    private void validar(BeneficiarioDto dto, Long id) {

        String tipoDocumento = Normalizador.texto(dto.getTipoDocumento());
        String numeroDocumento = Normalizador.documento(dto.getNumeroDocumento());
        if ((tipoDocumento == null) != (numeroDocumento == null)) {
            throw ExcepcionNegocio.invalido(
                    "Debe informar tipoDocumento y numeroDocumento juntos, o dejar ambos vacios");
        }
        if (numeroDocumento != null) {
            tipoDocumento = Normalizador.clave(tipoDocumento);
            if (!Normalizador.documentoValido(numeroDocumento)) {
                throw ExcepcionNegocio.invalido(
                        "numeroDocumento invalido; si no lo conoce, deje el campo vacio");
            }
            Optional<Beneficiario> existente =
                    repository.findByTipoDocumentoAndNumeroDocumento(
                            tipoDocumento, numeroDocumento);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw ExcepcionNegocio.conflicto("Ya existe un beneficiario con ese documento");
            }
        }
        dto.setTipoDocumento(tipoDocumento);
        dto.setNumeroDocumento(numeroDocumento);
    }

    private void copiarCampos(BeneficiarioDto dto, Beneficiario registro) {
        registro.setPrimerNombre(Normalizador.texto(dto.getPrimerNombre()));
        registro.setSegundoNombre(Normalizador.texto(dto.getSegundoNombre()));
        registro.setPrimerApellido(Normalizador.texto(dto.getPrimerApellido()));
        registro.setSegundoApellido(Normalizador.texto(dto.getSegundoApellido()));
        registro.setTipoDocumento(Normalizador.texto(dto.getTipoDocumento()));
        registro.setNumeroDocumento(Normalizador.texto(dto.getNumeroDocumento()));
        registro.setFechaNacimiento(dto.getFechaNacimiento());
        registro.setCelular(Normalizador.texto(dto.getCelular()));
        registro.setMunicipio(Normalizador.texto(dto.getMunicipio()));
        registro.setDireccion(Normalizador.texto(dto.getDireccion()));
        registro.setGrupoPoblacional(Normalizador.texto(dto.getGrupoPoblacional()));
        registro.setPertenenciaEtnica(Normalizador.texto(dto.getPertenenciaEtnica()));
        registro.setJefaturaHogar(Boolean.TRUE.equals(dto.getJefaturaHogar()));
        registro.setTieneDiscapacidad(Boolean.TRUE.equals(dto.getTieneDiscapacidad()));
        registro.setDiscapacidad(Normalizador.texto(dto.getDiscapacidad()));
        registro.setObservaciones(Normalizador.texto(dto.getObservaciones()));
        String nombreCompleto =
                String.join(
                        " ",
                        dto.getPrimerNombre(),
                        Objects.toString(dto.getSegundoNombre(), ""),
                        dto.getPrimerApellido(),
                        Objects.toString(dto.getSegundoApellido(), ""));
        registro.setNombreNormalizado(Normalizador.clave(nombreCompleto));
    }

    public BeneficiarioDto convertirADto(Beneficiario registro) {
        BeneficiarioDto dto = new BeneficiarioDto();
        dto.setId(registro.getId());
        dto.setVersion(registro.getVersion());
        dto.setActivo(registro.getActivo());
        dto.setDtCreacion(registro.getDtCreacion());
        dto.setDtActualizacion(registro.getDtActualizacion());
        dto.setUsuarioCreacion(registro.getUsuarioCreacion());
        dto.setUsuarioActualizacion(registro.getUsuarioActualizacion());
        dto.setPrimerNombre(registro.getPrimerNombre());
        dto.setSegundoNombre(registro.getSegundoNombre());
        dto.setPrimerApellido(registro.getPrimerApellido());
        dto.setSegundoApellido(registro.getSegundoApellido());
        dto.setTipoDocumento(registro.getTipoDocumento());
        dto.setNumeroDocumento(registro.getNumeroDocumento());
        dto.setFechaNacimiento(registro.getFechaNacimiento());
        dto.setCelular(registro.getCelular());
        dto.setMunicipio(registro.getMunicipio());
        dto.setDireccion(registro.getDireccion());
        dto.setGrupoPoblacional(registro.getGrupoPoblacional());
        dto.setPertenenciaEtnica(registro.getPertenenciaEtnica());
        dto.setJefaturaHogar(Boolean.TRUE.equals(registro.getJefaturaHogar()));
        dto.setTieneDiscapacidad(Boolean.TRUE.equals(registro.getTieneDiscapacidad()));
        dto.setDiscapacidad(registro.getDiscapacidad());
        dto.setObservaciones(registro.getObservaciones());
        dto.setCodigoInterno(registro.getCodigoInterno());
        dto.setIdBeneficiarioPrincipal(registro.getIdBeneficiarioPrincipal());
        dto.setEstadoRevisionDuplicidad(registro.getEstadoRevisionDuplicidad());
        dto.setEstadoConsentimiento(registro.getEstadoConsentimiento());
        cargarFamiliares(registro.getId(), dto);
        return dto;
    }

    @Override
    @Transactional
    public BeneficiarioDto agregarFamiliar(Long idBeneficiario, RegistrarFamiliarDto dto) {
        Beneficiario titular = obtener(idBeneficiario);
        controlAccesoService.validarBeneficiario(idBeneficiario);

        BeneficiarioDto familiarDto = dto.getBeneficiario();
        if (familiarDto.getMunicipio() == null || familiarDto.getMunicipio().isBlank()) {
            familiarDto.setMunicipio(titular.getMunicipio());
        }
        if (familiarDto.getDireccion() == null || familiarDto.getDireccion().isBlank()) {
            familiarDto.setDireccion(titular.getDireccion());
        }

        BeneficiarioDto familiarCreado = guardar(familiarDto);
        Long idFamilia = obtenerOCrearFamilia(titular);

        if (integranteFamiliaRepository
                .findByIdFamiliaAndIdBeneficiario(idFamilia, familiarCreado.getId())
                .isEmpty()) {
            IntegranteFamilia vinculo = new IntegranteFamilia();
            vinculo.setIdFamilia(idFamilia);
            vinculo.setIdBeneficiario(familiarCreado.getId());
            vinculo.setParentesco(Normalizador.texto(dto.getParentesco()));
            vinculo.setEdadRegistrada(dto.getEdad());
            integranteFamiliaRepository.saveAndFlush(vinculo);
        }

        log.info("Familiar {} vinculado al beneficiario {} en familia {}",
                familiarCreado.getId(), idBeneficiario, idFamilia);
        return convertirADto(titular);
    }

    @Override
    @Transactional
    public BeneficiarioDto removerFamiliar(Long idBeneficiario, Long idIntegrante) {
        Beneficiario titular = obtener(idBeneficiario);
        controlAccesoService.validarBeneficiario(idBeneficiario);

        IntegranteFamilia vinculo = integranteFamiliaRepository.findById(idIntegrante)
                .orElseThrow(() -> ExcepcionNegocio.noEncontrado("Integrante familiar"));

        boolean perteneceAlNucleo = integranteFamiliaRepository.findNucleoFamiliarActivo(idBeneficiario)
                .stream()
                .anyMatch(i -> Objects.equals(i.getId(), idIntegrante));
        if (!perteneceAlNucleo) {
            throw ExcepcionNegocio.conflicto("El integrante no pertenece al nucleo familiar del beneficiario");
        }
        if (Objects.equals(vinculo.getIdBeneficiario(), idBeneficiario)) {
            throw ExcepcionNegocio.conflicto("No se puede remover al titular del nucleo familiar");
        }

        vinculo.setActivo(false);
        integranteFamiliaRepository.saveAndFlush(vinculo);
        auditoriaService.registrar(
                "IntegranteFamilia",
                vinculo.getId(),
                "DESVINCULAR_FAMILIAR",
                null,
                null,
                "Familiar removido desde la ficha del beneficiario " + idBeneficiario);
        return convertirADto(titular);
    }

    private Long obtenerOCrearFamilia(Beneficiario titular) {
        List<IntegranteFamilia> vinculos =
                integranteFamiliaRepository.findActivosByIdBeneficiario(titular.getId());
        if (!vinculos.isEmpty()) {
            return vinculos.get(0).getIdFamilia();
        }

        Familia familia = new Familia();
        familia.setNombre("Nucleo familiar " + titular.getCodigoInterno());
        familia.setMunicipio(titular.getMunicipio());
        familia.setDireccion(titular.getDireccion());
        familiaRepository.saveAndFlush(familia);

        IntegranteFamilia titularVinculo = new IntegranteFamilia();
        titularVinculo.setIdFamilia(familia.getId());
        titularVinculo.setIdBeneficiario(titular.getId());
        titularVinculo.setParentesco("Titular");
        integranteFamiliaRepository.saveAndFlush(titularVinculo);
        return familia.getId();
    }

    private void cargarFamiliares(Long idBeneficiario, BeneficiarioDto dto) {
        if (idBeneficiario == null) {
            dto.setFamiliares(Collections.emptyList());
            dto.setCantidadFamiliares(0);
            return;
        }

        Map<Long, FamiliarBeneficiarioDto> unicos = new LinkedHashMap<>();
        for (IntegranteFamilia vinculo :
                integranteFamiliaRepository.findNucleoFamiliarActivo(idBeneficiario)) {
            if (Objects.equals(vinculo.getIdBeneficiario(), idBeneficiario)) {
                continue;
            }
            beneficiarioRepositoryFind(vinculo.getIdBeneficiario()).ifPresent(familiar -> {
                if (!Boolean.TRUE.equals(familiar.getActivo())) {
                    return;
                }
                FamiliarBeneficiarioDto item = FamiliarBeneficiarioDto.builder()
                        .idIntegrante(vinculo.getId())
                        .versionIntegrante(vinculo.getVersion())
                        .idBeneficiario(familiar.getId())
                        .primerNombre(familiar.getPrimerNombre())
                        .segundoNombre(familiar.getSegundoNombre())
                        .primerApellido(familiar.getPrimerApellido())
                        .segundoApellido(familiar.getSegundoApellido())
                        .tipoDocumento(familiar.getTipoDocumento())
                        .numeroDocumento(familiar.getNumeroDocumento())
                        .fechaNacimiento(familiar.getFechaNacimiento())
                        .edad(vinculo.getEdadRegistrada())
                        .parentesco(vinculo.getParentesco())
                        .tieneDiscapacidad(Boolean.TRUE.equals(familiar.getTieneDiscapacidad()))
                        .discapacidad(familiar.getDiscapacidad())
                        .build();
                unicos.putIfAbsent(familiar.getId(), item);
            });
        }
        dto.setFamiliares(new ArrayList<>(unicos.values()));
        dto.setCantidadFamiliares(unicos.size());
    }

    private Optional<Beneficiario> beneficiarioRepositoryFind(Long id) {
        return repository.findById(id);
    }

}
