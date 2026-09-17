/**
 * Adaptador de API HTTP (Spring Boot Backend REST)
 * Consume el Backend en http://localhost:8080/api/v1 con Basic Auth y DTO Mappings
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const DEFAULT_AUTH = btoa('administrador:aguapanela12');

class ApiAdapter {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.authHeader = `Basic ${DEFAULT_AUTH}`;
  }

  setAuth(usuario, clave) {
    if (usuario && clave) {
      this.authHeader = `Basic ${btoa(`${usuario}:${clave}`)}`;
    }
  }

  getHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.authHeader,
      'X-Requested-With': 'gestion-beneficiarios',
      ...customHeaders
    };
  }


  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      return json.datos !== undefined ? json.datos : json;
    } catch (err) {
      console.warn(`[ApiAdapter] Fallo petición en ${endpoint}:`, err.message);
      throw err;
    }
  }

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
      documentType: dto.tipoDocumento || 'CC',
      documentNumber: dto.numeroDocumento || '',
      birthDate: dto.fechaNacimiento || '',
      phone: dto.celular || '',
      municipality: dto.municipio || 'Apartadó',
      address: dto.direccion || '',
      internalCode: dto.codigoInterno || `UP-2026-${String(dto.id).padStart(4, '0')}`,
      familyMembers: []
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
      tipoDocumento: model.documentType || 'CC',
      numeroDocumento: model.documentNumber || '',
      fechaNacimiento: model.birthDate || null,
      celular: model.phone || null,
      municipio: model.municipality || 'Apartadó',
      direccion: model.address || null,
      codigoInterno: model.internalCode || null,
      activo: model.active !== false
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
    const res = await this.request(`/beneficiarios?${query.toString()}`);
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    return items.map(dto => this.fromBeneficiarioDto(dto));
  }

  async getBeneficiarioById(id) {
    const dto = await this.request(`/beneficiarios/${id}`);
    return this.fromBeneficiarioDto(dto);
  }

  async createBeneficiario(model) {
    const dto = this.toBeneficiarioDto(model);
    const createdDto = await this.request('/beneficiarios', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return this.fromBeneficiarioDto(createdDto);
  }

  async updateBeneficiario(id, model) {
    const dto = this.toBeneficiarioDto(model);
    const updatedDto = await this.request(`/beneficiarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
    return this.fromBeneficiarioDto(updatedDto);
  }

  async getAtenciones() {
    const res = await this.request('/atenciones?pagina=0&tamanio=100');
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    return items.map(dto => this.fromAtencionDto(dto));
  }

  async createAtencion(model) {
    const dto = this.toAtencionDto(model);
    const createdDto = await this.request('/atenciones', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return this.fromAtencionDto(createdDto);
  }

  async getProgramas() {
    const res = await this.request('/programas?pagina=0&tamanio=100');
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    return items.map(dto => this.fromProgramaDto(dto));
  }

  async getFicha360(id) {
    return await this.request(`/beneficiarios/${id}/historial`);
  }
}

export const apiAdapter = new ApiAdapter();
