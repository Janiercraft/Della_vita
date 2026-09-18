import { apiFetch } from '../api/apiClient';

/**
 * Adaptador de API HTTP (Spring Boot Backend REST)
 * Consume el Backend y se apoya en apiClient (apiFetch) que ya maneja JWT/Basic Auth
 */

class ApiAdapter {
  // --- DTO TRANSFORMERS ---
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
      
      // Caracterización
      populationGroup: dto.grupoPoblacional || 'Comunidad Local',
      ethnicity: dto.pertenenciaEtnica || 'Ninguna / No aplica',
      isHeadOfHousehold: dto.jefaturaHogar === true,
      disability: dto.discapacidad || '',
      
      // Familia
      familyMembers: (dto.familiares && dto.familiares.length > 0) 
          ? dto.familiares.map(f => ({
              id: f.id,
              fullName: f.nombreCompleto || `${f.primerNombre} ${f.primerApellido}`,
              firstName: f.primerNombre,
              firstLastName: f.primerApellido,
              documentType: f.tipoDocumento,
              documentNumber: f.numeroDocumento,
              relationship: f.parentesco
          })) 
          : Array(dto.cantidadFamiliares || 0).fill({ id: 'dummy', fullName: 'Familiar Registrado' }),
      
      duplicityStatus: dto.estadoRevisionDuplicidad || 'APROBADO',
      dataProcessingConsent: dto.estadoConsentimiento === 'OTORGADO' || dto.estadoConsentimiento === 'ACTIVO',
      consentStatus: dto.estadoConsentimiento || 'PENDIENTE'
    };
  }

  toBeneficiarioDto(model) {
    const nameParts = (model.fullName || '').trim().split(/\s+/);
    const primerNombre = model.firstName || nameParts[0] || 'Nombre';
    const segundoNombre = model.secondName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '');
    const primerApellido = model.firstLastName || nameParts[nameParts.length - 1] || 'Apellido';
    const segundoApellido = model.secondLastName || '';

    return {
      id: model.rawId || (model.id && !isNaN(model.id) ? Number(model.id) : null),
      version: model.version || 0,
      primerNombre,
      segundoNombre: segundoNombre || null,
      primerApellido,
      segundoApellido: segundoApellido || null,
      tipoDocumento: model.documentType === 'SD' ? null : (model.documentType || null),
      numeroDocumento: model.documentType === 'SD' ? null : (model.documentNumber || null),
      fechaNacimiento: model.birthDate || null,
      celular: model.phone || null,
      municipio: model.municipality || 'Apartadó',
      direccion: model.address || null,
      codigoInterno: model.internalCode || null,
      
      // Caracterización
      grupoPoblacional: model.populationGroup || null,
      pertenenciaEtnica: model.ethnicity || null,
      jefaturaHogar: model.isHeadOfHousehold === true,
      discapacidad: model.disability || null,
      
      activo: model.active !== false,
      estadoRevisionDuplicidad: model.duplicityStatus || 'APROBADO',
      estadoConsentimiento: model.dataProcessingConsent ? 'OTORGADO' : (model.consentStatus || 'PENDIENTE')
    };
  }

  fromAtencionDto(dto) {
    if (!dto) return null;
    return {
      id: String(dto.id),
      beneficiaryId: String(dto.idBeneficiario),
      date: dto.fecha || new Date().toISOString().split('T')[0],
      serviceType: dto.tipoServicio || 'Atención General',
      description: dto.descripcion || '',
      professional: dto.profesional || 'Equipo Técnico',
      status: dto.estado || 'Completada',
      municipality: dto.municipio || 'Apartadó'
    };
  }

  toAtencionDto(model) {
    return {
      idBeneficiario: Number(model.beneficiaryId),
      fecha: model.date || new Date().toISOString().split('T')[0],
      tipoServicio: model.serviceType,
      descripcion: model.description,
      profesional: model.professional,
      estado: model.status || 'Completada',
      municipio: model.municipality || 'Apartadó'
    };
  }

  fromProgramaDto(dto) {
    if (!dto) return null;
    return {
      id: String(dto.id),
      name: dto.nombre,
      code: dto.codigo,
      category: dto.categoria || 'General',
      description: dto.descripcion,
      active: dto.activo !== false
    };
  }

  // --- API ENDPOINTS ---
  async getBeneficiarios(params = {}) {
    const query = new URLSearchParams({
      nombre: params.nombre || '',
      documento: params.documento || '',
      pagina: params.pagina || 0,
      tamanio: params.tamanio || 100
    });
    const res = await apiFetch.get(`/beneficiarios?${query.toString()}`);
    const items = Array.isArray(res.datos) ? res.datos : (res.datos?.content ? res.datos.content : []);
    return items.map(dto => this.fromBeneficiarioDto(dto));
  }

  async getBeneficiarioById(id) {
    const res = await apiFetch.get(`/beneficiarios/${id}`);
    return this.fromBeneficiarioDto(res.datos);
  }

  async createBeneficiario(model) {
    const dto = this.toBeneficiarioDto(model);
    let res = await apiFetch.post('/beneficiarios', dto);
    
    const estadoConsentimiento = model.dataProcessingConsent ? 'OTORGADO' : (model.consentStatus || 'PENDIENTE');
    if (estadoConsentimiento !== 'PENDIENTE') {
      try {
        await apiFetch.patch(`/beneficiarios/${res.datos.id}/consentimiento`, {
          version: res.datos.version || 0,
          estado: estadoConsentimiento,
          motivo: 'Autorización firmada desde frontend'
        });
        res.datos.estadoConsentimiento = estadoConsentimiento;
        res.datos.version = (res.datos.version || 0) + 1; // optimistic update
      } catch(e) {
        console.warn('Fallo guardando consentimiento:', e);
      }
    }
    
    return this.fromBeneficiarioDto(res.datos);
  }

  async updateBeneficiario(id, model) {
    const dto = this.toBeneficiarioDto(model);
    let res = await apiFetch.put(`/beneficiarios/${id}`, dto);
    
    const estadoConsentimiento = model.dataProcessingConsent ? 'OTORGADO' : (model.consentStatus || 'PENDIENTE');
    try {
      await apiFetch.patch(`/beneficiarios/${id}/consentimiento`, {
        version: model.version || 0,
        estado: estadoConsentimiento,
        motivo: 'Actualizado desde frontend'
      });
      res.datos.estadoConsentimiento = estadoConsentimiento;
      res.datos.version = (res.datos.version || 0) + 1;
    } catch(e) {
      console.warn('Fallo actualizando consentimiento:', e);
    }

    return this.fromBeneficiarioDto(res.datos);
  }

  async changeBeneficiarioStatus(id, activo, motivo) {
    const res = await apiFetch.patch(`/beneficiarios/${id}/estado`, {
      activo: activo,
      motivo: motivo || 'Actualización de estado desde UI'
    });
    return this.fromBeneficiarioDto(res.datos);
  }
  
  async addFamiliar(beneficiarioId, familiarModel) {
    const dtoFamiliar = this.toBeneficiarioDto(familiarModel);
    // Usamos el nuevo endpoint orquestador
    const res = await apiFetch.post(`/beneficiarios/${beneficiarioId}/familiares`, {
       beneficiario: dtoFamiliar,
       parentesco: familiarModel.relationship || 'Familiar'
    });
    return this.fromBeneficiarioDto(res.datos);
  }

  async getAtenciones() {
    const res = await apiFetch.get('/atenciones?pagina=0&tamanio=100');
    const items = Array.isArray(res.datos) ? res.datos : (res.datos?.content ? res.datos.content : []);
    return items.map(dto => this.fromAtencionDto(dto));
  }

  async createAtencion(model) {
    const dto = this.toAtencionDto(model);
    const res = await apiFetch.post('/atenciones', dto);
    return this.fromAtencionDto(res.datos);
  }

  async getProgramas() {
    const res = await apiFetch.get('/programas?pagina=0&tamanio=100');
    const items = Array.isArray(res.datos) ? res.datos : (res.datos?.content ? res.datos.content : []);
    return items.map(dto => this.fromProgramaDto(dto));
  }

  async getFicha360(id) {
    const res = await apiFetch.get(`/beneficiarios/${id}/historial`);
    return res.datos;
  }
}

export const apiAdapter = new ApiAdapter();
