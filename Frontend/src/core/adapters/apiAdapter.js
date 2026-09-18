import { apiFetch } from '../api/apiClient';

const unwrap = (res) => {
  if (!res) return null;
  if (res.datos !== undefined) return res.datos;
  return res;
};

const unwrapList = (res) => {
  const datos = unwrap(res);
  if (Array.isArray(datos)) return datos;
  if (datos?.content && Array.isArray(datos.content)) return datos.content;
  return [];
};

const idemKey = (prefix = 'ui') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

class ApiAdapter {
  fromBeneficiarioDto(dto) {
    if (!dto) return null;
    const names = [dto.primerNombre, dto.segundoNombre, dto.primerApellido, dto.segundoApellido]
      .filter(Boolean)
      .join(' ');
    return {
      id: String(dto.id),
      rawId: dto.id,
      version: dto.version || 0,
      active: dto.activo !== false,
      fullName: names || 'Sin Nombre',
      firstName: dto.primerNombre || '',
      secondName: dto.segundoNombre || '',
      firstLastName: dto.primerApellido || '',
      secondLastName: dto.segundoApellido || '',
      documentType: dto.tipoDocumento || 'SD',
      documentNumber: dto.numeroDocumento || '',
      birthDate: dto.fechaNacimiento || '',
      phone: dto.celular || '',
      municipality: dto.municipio || 'Apartadó',
      address: dto.direccion || '',
      internalCode: dto.codigoInterno || `UP-2026-${String(dto.id).padStart(4, '0')}`,
      populationGroup: dto.grupoPoblacional || 'Comunidad Local',
      ethnicity: dto.pertenenciaEtnica || 'Ninguna / No aplica',
      isHeadOfHousehold: dto.jefaturaHogar === true,
      hasDisability: dto.tieneDiscapacidad === true || Boolean(dto.discapacidad),
      disability: dto.discapacidad || '',
      disabilityDetails: dto.discapacidad || '',
      notes: dto.observaciones || '',
      registeredAt: dto.dtCreacion || null,
      updatedAt: dto.dtActualizacion || null,
      familyMembers: (dto.familiares || []).map((f) => ({
        id: String(f.id || f.idIntegrante || Math.random()),
        beneficiaryId: f.idBeneficiario ? String(f.idBeneficiario) : null,
        fullName: f.nombreCompleto || [f.primerNombre, f.segundoNombre, f.primerApellido, f.segundoApellido].filter(Boolean).join(' '),
        firstName: f.primerNombre,
        firstLastName: f.primerApellido,
        documentType: f.tipoDocumento,
        documentNumber: f.numeroDocumento,
        relationship: f.parentesco,
        kinship: f.parentesco,
        age: f.edad ?? '',
        hasDisability: f.tieneDiscapacidad === true || Boolean(f.discapacidad),
        disability: f.discapacidad || ''
      })),
      duplicityStatus: dto.estadoRevisionDuplicidad || 'APROBADO',
      dataProcessingConsent: dto.estadoConsentimiento === 'OTORGADO' || dto.estadoConsentimiento === 'ACTIVO',
      consentStatus: dto.estadoConsentimiento || 'PENDIENTE'
    };
  }

  toBeneficiarioDto(model) {
    const nameParts = (model.fullName || '').trim().split(/\s+/);
    const limpio = (v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'string' && v.trim() === '') return null;
      return v;
    };

    const dto = {
      primerNombre: limpio(model.firstName) || limpio(nameParts[0]) || 'Nombre',
      segundoNombre: limpio(model.secondName) || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null),
      primerApellido: limpio(model.firstLastName) || limpio(nameParts[nameParts.length - 1]) || 'Apellido',
      segundoApellido: limpio(model.secondLastName),
      tipoDocumento: model.documentType === 'SD' ? null : limpio(model.documentType),
      numeroDocumento: model.documentType === 'SD' ? null : limpio(model.documentNumber),
      fechaNacimiento: limpio(model.birthDate),
      celular: limpio(model.phone),
      municipio: limpio(model.municipality) || 'Apartadó',
      direccion: limpio(model.address),
      grupoPoblacional: limpio(model.populationGroup),
      pertenenciaEtnica: limpio(model.ethnicity),
      jefaturaHogar: model.isHeadOfHousehold === true,
      tieneDiscapacidad: model.hasDisability === true,
      discapacidad: model.hasDisability ? limpio(model.disabilityDetails || model.disability) : null,
      observaciones: limpio(model.notes),
      activo: model.active !== false
    };

    const id = model.rawId || (model.id && !Number.isNaN(Number(model.id)) ? Number(model.id) : null);
    if (id) {
      dto.id = id;
      dto.version = model.version || 0;
    }

    return dto;
  }

  fromAtencionDto(dto, meta = {}) {
    if (!dto) return null;
    return {
      id: String(dto.id),
      rawId: dto.id,
      version: dto.version || 0,
      participationId: String(dto.idParticipacion || ''),
      beneficiaryId: String(meta.beneficiaryId || dto.idBeneficiario || ''),
      beneficiaryName: meta.beneficiaryName || dto.nombreBeneficiario || 'Beneficiario',
      beneficiaryCode: meta.beneficiaryCode || '',
      beneficiaryMunicipality: meta.municipality || 'Apartadó',
      attentionTypeId: (dto.tipoAtencion || 'atencion_general').toLowerCase().replace(/\s+/g, '_'),
      attentionTypeLabel: dto.tipoAtencion || 'Atención General',
      date: dto.fechaAtencion || dto.fecha || '',
      quantity: dto.resultado || '1 unidad / sesión',
      responsibleOrg: dto.responsable || 'Equipo URABÁ-PAÍS',
      referral: dto.remision || 'Ninguna / Atención directa',
      notes: dto.observaciones || dto.descripcion || '',
      status: dto.estadoValidacionAyuda || 'Registrada',
      type: 'attention'
    };
  }

  fromSeguimientoDto(dto, meta = {}) {
    if (!dto) return null;
    const mapStatus = { PENDIENTE: 'alerta', EN_PROCESO: 'estable', FINALIZADO: 'mejora' };
    return {
      id: String(dto.id),
      rawId: dto.id,
      version: dto.version || 0,
      participationId: String(dto.idParticipacion || ''),
      beneficiaryId: String(meta.beneficiaryId || ''),
      beneficiaryName: meta.beneficiaryName || 'Beneficiario',
      beneficiaryCode: meta.beneficiaryCode || '',
      beneficiaryMunicipality: meta.municipality || 'Apartadó',
      date: dto.fechaSeguimiento || '',
      status: mapStatus[dto.estadoSeguimiento] || (dto.estadoSeguimiento || 'estable').toLowerCase(),
      observation: dto.avanceNovedad || dto.observaciones || '',
      pendingAction: dto.accionPendiente || '',
      nextContactDate: dto.fechaProximoSeguimiento || '',
      responsibleStaff: dto.responsable || dto.usuarioCreacion || 'Funcionario Territorial',
      type: 'followup'
    };
  }

  fromParticipacionDto(dto, meta = {}) {
    if (!dto) return null;
    return {
      id: String(dto.id),
      rawId: dto.id,
      version: dto.version || 0,
      beneficiaryId: String(dto.idBeneficiario),
      programId: String(dto.idPrograma),
      programName: meta.programName || `Programa ${dto.idPrograma}`,
      programCode: meta.programCode || `PRG-${dto.idPrograma}`,
      lineId: meta.lineId || 'linea-1',
      lineName: meta.lineName || meta.lineaIntervencion || 'Línea de intervención',
      beneficiaryName: meta.beneficiaryName || '',
      beneficiaryCode: meta.beneficiaryCode || '',
      beneficiaryDoc: meta.beneficiaryDoc || '',
      beneficiaryMunicipality: meta.municipality || '',
      enrollmentDate: dto.fechaIngreso || '',
      status: (dto.estadoParticipacion || 'INSCRITO').toLowerCase(),
      notes: dto.observaciones || '',
      periodo: dto.periodo || '',
      createdAt: dto.dtCreacion || null,
      updatedAt: dto.dtActualizacion || null
    };
  }

  fromProgramaDto(dto) {
    if (!dto) return null;
    return {
      id: String(dto.id),
      rawId: dto.id,
      version: dto.version || 0,
      name: dto.nombre,
      code: dto.codigo || `PRG-${dto.id}`,
      lineId: dto.codigoLinea || dto.lineaIntervencion || 'general',
      lineName: dto.lineaIntervencion || 'General',
      category: dto.lineaIntervencion || 'General',
      leadOrg: dto.organizacionLider || '',
      targetEstimated: dto.metaEstimada ?? null,
      description: dto.descripcion || '',
      createdAt: dto.dtCreacion || null,
      updatedAt: dto.dtActualizacion || null,
      active: dto.activo !== false
    };
  }

  // --- Beneficiarios ---
  async getBeneficiarios(params = {}) {
    const query = new URLSearchParams({
      nombre: params.nombre || '',
      documento: params.documento || '',
      pagina: params.pagina || 0,
      tamanio: params.tamanio || 100
    });
    return unwrapList(await apiFetch.get(`/beneficiarios?${query}`)).map((d) => this.fromBeneficiarioDto(d));
  }

  async getBeneficiarioById(id) {
    return this.fromBeneficiarioDto(unwrap(await apiFetch.get(`/beneficiarios/${id}`)));
  }

  async getMiBeneficiario() {
    return this.fromBeneficiarioDto(unwrap(await apiFetch.get('/auth/mi-beneficiario')));
  }

  async createBeneficiario(model) {
    let res = unwrap(await apiFetch.post('/beneficiarios', this.toBeneficiarioDto(model)));
    const estado = model.dataProcessingConsent ? 'OTORGADO' : (model.consentStatus || 'PENDIENTE');
    if (estado !== 'PENDIENTE' && res?.id) {
      res = unwrap(await apiFetch.patch(`/beneficiarios/${res.id}/consentimiento`, {
        version: res.version || 0,
        estado,
        motivo: 'Autorización desde frontend'
      }));
    }
    return this.fromBeneficiarioDto(res);
  }

  async updateBeneficiario(id, model) {
    const res = unwrap(await apiFetch.put(`/beneficiarios/${id}`, this.toBeneficiarioDto(model)));
    const estadoDeseado = model.dataProcessingConsent ? 'OTORGADO' : (model.consentStatus || 'PENDIENTE');
    if (res?.id && estadoDeseado && estadoDeseado !== res.estadoConsentimiento) {
      const actualizado = unwrap(await apiFetch.patch(`/beneficiarios/${res.id}/consentimiento`, {
        version: res.version || 0,
        estado: estadoDeseado,
        motivo: 'Actualización de autorización desde frontend'
      }));
      return this.fromBeneficiarioDto(actualizado);
    }
    return this.fromBeneficiarioDto(res);
  }

  async changeBeneficiarioStatus(id, activo, motivo, version = null) {
    let versionActual = version;
    if (versionActual === null || versionActual === undefined) {
      const actual = unwrap(await apiFetch.get(`/beneficiarios/${id}`));
      versionActual = actual?.version ?? 0;
    }
    return this.fromBeneficiarioDto(unwrap(await apiFetch.patch(`/beneficiarios/${id}/estado`, {
      activo,
      version: versionActual,
      motivo: motivo || 'Actualización desde UI'
    })));
  }

  async addFamiliar(beneficiarioId, familiarModel) {
    const familiarDto = this.toBeneficiarioDto(familiarModel);
    // El backend hereda municipio/dirección del titular cuando vienen vacíos.
    familiarDto.municipio = null;
    familiarDto.direccion = null;

    const actualizado = unwrap(await apiFetch.post(`/beneficiarios/${beneficiarioId}/familiares`, {
      beneficiario: familiarDto,
      parentesco: familiarModel.kinship || familiarModel.relationship || 'Familiar',
      edad: Number.isFinite(Number(familiarModel.age)) ? Number(familiarModel.age) : null
    }));
    return this.fromBeneficiarioDto(actualizado);
  }

  async removeFamiliar(beneficiarioId, integranteId) {
    const actualizado = unwrap(await apiFetch.delete(`/beneficiarios/${beneficiarioId}/familiares/${integranteId}`));
    return this.fromBeneficiarioDto(actualizado);
  }

  async getFicha360(id) {
    return unwrap(await apiFetch.get(`/beneficiarios/${id}/historial?pagina=0&tamanio=50`));
  }

  async getResumenReportes() {
    return unwrap(await apiFetch.get('/reportes/resumen'));
  }

  // --- Programas / Participaciones ---
  async getProgramas() {
    return unwrapList(await apiFetch.get('/programas?pagina=0&tamanio=100')).map((d) => this.fromProgramaDto(d));
  }

  async getParticipaciones() {
    return unwrapList(await apiFetch.get('/participaciones?pagina=0&tamanio=100'));
  }

  async createParticipacion(model) {
    const dto = {
      idBeneficiario: Number(model.beneficiaryId),
      idPrograma: Number(model.programId),
      periodo: model.periodo || new Date().getFullYear().toString(),
      fechaIngreso: model.enrollmentDate || new Date().toISOString().slice(0, 10),
      estadoParticipacion: (model.status || 'INSCRITO').toUpperCase(),
      observaciones: model.notes || null
    };
    return unwrap(await apiFetch.post('/participaciones', dto));
  }

  async updateParticipacion(id, dto) {
    return unwrap(await apiFetch.put(`/participaciones/${id}`, dto));
  }

  async changeParticipacionEstado(id, activo, motivo, version = null) {
    let versionActual = version;
    if (versionActual === null || versionActual === undefined) {
      const actual = unwrap(await apiFetch.get(`/participaciones/${id}`));
      versionActual = actual?.version ?? 0;
    }
    return unwrap(await apiFetch.patch(`/participaciones/${id}/estado`, { activo, version: versionActual, motivo }));
  }

  async ensureParticipacion(beneficiaryId) {
    const list = await this.getParticipaciones();
    const found = list.find((p) => String(p.idBeneficiario) === String(beneficiaryId) && p.activo !== false);
    if (found) return found;
    const programas = await this.getProgramas();
    const prog = programas.find((p) => p.active !== false) || programas[0];
    if (!prog) throw new Error('No hay programas activos para vincular la atención');
    return this.createParticipacion({
      beneficiaryId,
      programId: prog.rawId || prog.id,
      status: 'INSCRITO',
      notes: 'Vinculación automática para registrar atención/seguimiento'
    });
  }

  // --- Atenciones / Seguimientos ---
  async getAtenciones() {
    return unwrapList(await apiFetch.get('/atenciones?pagina=0&tamanio=100'));
  }

  async createAtencion(model) {
    const participacion = model.participationId
      ? { id: Number(model.participationId) }
      : await this.ensureParticipacion(model.beneficiaryId);
    const dto = {
      idParticipacion: Number(participacion.id || participacion.rawId),
      fechaAtencion: model.date || new Date().toISOString().slice(0, 10),
      tipoAtencion: model.attentionTypeLabel || model.serviceType || 'Atención General',
      descripcion: model.notes || null,
      responsable: model.responsibleOrg || null,
      resultado: model.quantity || null,
      remision: model.referral || null,
      observaciones: model.notes || null
    };
    const created = unwrap(await apiFetch.post('/atenciones', dto, {
      headers: { 'Idempotency-Key': idemKey('att') }
    }));
    return this.fromAtencionDto(created, model);
  }

  async getSeguimientos() {
    return unwrapList(await apiFetch.get('/seguimientos?pagina=0&tamanio=100'));
  }

  async createSeguimiento(model) {
    const mapEstado = { alerta: 'PENDIENTE', estable: 'EN_PROCESO', mejora: 'FINALIZADO' };
    const participacion = model.participationId
      ? { id: Number(model.participationId) }
      : await this.ensureParticipacion(model.beneficiaryId);
    const dto = {
      idParticipacion: Number(participacion.id || participacion.rawId),
      fechaSeguimiento: model.date || new Date().toISOString().slice(0, 10),
      fechaProximoSeguimiento: model.nextContactDate || null,
      estadoSeguimiento: mapEstado[model.status] || 'EN_PROCESO',
      avanceNovedad: model.observation || null,
      accionPendiente: model.pendingAction || null,
      responsable: model.responsibleStaff || null,
      observaciones: model.observation || model.notes || 'Seguimiento registrado'
    };
    const created = unwrap(await apiFetch.post('/seguimientos', dto, {
      headers: { 'Idempotency-Key': idemKey('seg') }
    }));
    return this.fromSeguimientoDto(created, model);
  }

  // --- Eventos / autovinculación del beneficiario ---
  async getEventos(idPrograma = null, soloActivos = true) {
    const q = new URLSearchParams();
    if (idPrograma !== null && idPrograma !== undefined) q.set('idPrograma', idPrograma);
    q.set('soloActivos', String(soloActivos));
    return unwrapList(await apiFetch.get(`/eventos?${q.toString()}`));
  }

  async createEvento(dto) {
    return unwrap(await apiFetch.post('/eventos', dto));
  }

  async updateEvento(id, dto) {
    return unwrap(await apiFetch.put(`/eventos/${id}`, dto));
  }

  async postularmePrograma(idPrograma) {
    return unwrap(await apiFetch.post(`/eventos/postularme/${idPrograma}`, {}));
  }

  async postularmeEvento(idEvento) {
    return unwrap(await apiFetch.post(`/eventos/${idEvento}/postularme`, {}));
  }

  async cancelarMiInscripcionEvento(idEvento) {
    return unwrap(await apiFetch.delete(`/eventos/${idEvento}/mi-inscripcion`));
  }

  async getMisEventos() {
    return unwrapList(await apiFetch.get('/eventos/mis-eventos'));
  }

  async getMisParticipaciones() {
    return unwrapList(await apiFetch.get('/eventos/mis-participaciones'));
  }

  // --- Catálogos / Duplicidades / Importaciones / Auditoría ---
  async getCatalogos(tipo = '') {
    const q = tipo ? `?tipo=${encodeURIComponent(tipo)}&pagina=0&tamanio=100` : '?pagina=0&tamanio=100';
    return unwrapList(await apiFetch.get(`/catalogos${q}`));
  }

  async getDuplicidades() {
    return unwrap(await apiFetch.get('/duplicidades'));
  }

  async getCandidatosDuplicidad(idBeneficiario) {
    return unwrap(await apiFetch.get(`/duplicidades/${idBeneficiario}/candidatos`));
  }

  async resolverDuplicidad(idBeneficiario, body) {
    return unwrap(await apiFetch.post(`/duplicidades/${idBeneficiario}/resolver`, body));
  }

  async unificarBeneficiarios(body) {
    return unwrap(await apiFetch.post('/beneficiarios/unificar', body));
  }

  async getImportaciones() {
    return unwrapList(await apiFetch.get('/importaciones?pagina=0&tamanio=50'));
  }

  async analizarArchivoImportacion(archivo, { hoja = 0, separador = 'AUTO' } = {}) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const query = new URLSearchParams({ hoja: String(hoja), separador });
    return unwrap(await apiFetch.postForm(`/importaciones/analizar?${query.toString()}`, formData));
  }

  async importarArchivoAutomatico(archivo, { confirmar = true, hoja = 0, separador = 'AUTO' } = {}) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const query = new URLSearchParams({
      confirmar: String(confirmar),
      hoja: String(hoja),
      separador
    });
    return unwrap(await apiFetch.postForm(`/importaciones/auto?${query.toString()}`, formData));
  }

  async confirmarImportacion(id) {
    return unwrap(await apiFetch.post(`/importaciones/${id}/confirmar`, {}));
  }

  async getImportacion(id) {
    return unwrap(await apiFetch.get(`/importaciones/${id}`));
  }

  async getFilasImportacion(id, pagina = 0, tamanio = 100) {
    return unwrap(await apiFetch.get(`/importaciones/${id}/filas?pagina=${pagina}&tamanio=${tamanio}`));
  }

  async getReporteImportacion(id) {
    return unwrap(await apiFetch.get(`/importaciones/${id}/reporte`));
  }

  async resolverFilaImportacion(idImportacion, idFila, body) {
    return unwrap(await apiFetch.post(`/importaciones/${idImportacion}/filas/${idFila}/resolver`, body));
  }

  async getAuditorias() {
    return unwrapList(await apiFetch.get('/auditorias?pagina=0&tamanio=50'));
  }

  async getUsuarios() {
    return unwrapList(await apiFetch.get('/usuarios?pagina=0&tamanio=50'));
  }

  // --- IA ---
  async chatIa(pregunta, idBeneficiario = null, rolUi = 'admin') {
    const body = { pregunta };
    if (idBeneficiario) body.idBeneficiario = Number(idBeneficiario);
    let endpoint = '/ia/chat';
    if (rolUi === 'profesional') endpoint = '/ia/funcionario/chat';
    if (rolUi === 'usuario') endpoint = '/ia/mi-informacion/chat';
    try {
      return unwrap(await apiFetch.post(endpoint, body));
    } catch (err) {
      if (endpoint !== '/ia/chat') return unwrap(await apiFetch.post('/ia/chat', body));
      throw err;
    }
  }

  async getSugerenciasIa() {
    return unwrap(await apiFetch.get('/ia/sugerencias')) || [];
  }

  async resumenIa() {
    return unwrap(await apiFetch.post('/ia/resumen', {}));
  }
}

export const apiAdapter = new ApiAdapter();
