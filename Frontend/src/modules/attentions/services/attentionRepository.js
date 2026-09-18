import { apiAdapter } from '../../../core/adapters/apiAdapter';
import { textMatches } from '../../../core/utils/textUtils';

class AttentionRepository {
  constructor() {
    this._attentions = [];
    this._followups = [];
    this._loaded = false;
  }

  async load() {
    const [attsRaw, segsRaw, parts, bens] = await Promise.all([
      apiAdapter.getAtenciones(),
      apiAdapter.getSeguimientos(),
      apiAdapter.getParticipaciones(),
      apiAdapter.getBeneficiarios()
    ]);

    const partMap = Object.fromEntries(parts.map((p) => [String(p.id), p]));
    const benMap = Object.fromEntries(bens.map((b) => [String(b.rawId || b.id), b]));

    const metaFor = (idParticipacion) => {
      const part = partMap[String(idParticipacion)] || {};
      const ben = benMap[String(part.idBeneficiario)] || {};
      return {
        beneficiaryId: String(part.idBeneficiario || ''),
        beneficiaryName: ben.fullName || 'Beneficiario',
        beneficiaryCode: ben.internalCode || '',
        municipality: ben.municipality || 'Apartadó'
      };
    };

    this._attentions = attsRaw.map((d) => apiAdapter.fromAtencionDto(d, metaFor(d.idParticipacion)));
    this._followups = segsRaw.map((d) => apiAdapter.fromSeguimientoDto(d, metaFor(d.idParticipacion)));
    this._loaded = true;
    return { attentions: this._attentions, followups: this._followups };
  }

  getAttentions() {
    return this._attentions;
  }

  getFollowUps() {
    return this._followups;
  }

  getAllEvents() {
    return [...this._attentions, ...this._followups].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getByBeneficiaryId(beneficiaryId) {
    return this.getAllEvents().filter((e) => String(e.beneficiaryId) === String(beneficiaryId));
  }

  searchInList(list, query = '') {
    const q = query.trim();
    if (!q) return list;
    return list.filter((item) =>
      textMatches(item.beneficiaryName, q)
      || textMatches(item.beneficiaryCode, q)
      || textMatches(item.notes || item.observation, q)
    );
  }

  async createAttention(data) {
    const created = await apiAdapter.createAtencion(data);
    this._attentions = [created, ...this._attentions];
    return created;
  }

  async createFollowUp(data) {
    const created = await apiAdapter.createSeguimiento(data);
    this._followups = [created, ...this._followups];
    return created;
  }

  async resetData() {
    return this.load();
  }
}

export const attentionRepository = new AttentionRepository();
