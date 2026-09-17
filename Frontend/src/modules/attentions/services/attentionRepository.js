import { storageAdapter } from '../../../core/adapters/storageAdapter';
import { ATTENTION_TYPES, FOLLOWUP_STATUSES } from '../../../core/domain/attentionRules';
import { textMatches } from '../../../core/utils/textUtils';

const ATTENTIONS_STORAGE_KEY = 'uraba_attentions_data';
const FOLLOWUPS_STORAGE_KEY = 'uraba_followups_data';

// Datos iniciales de semilla representativos para Urabá-País
const INITIAL_ATTENTIONS = [
  {
    id: 'att-001',
    beneficiaryId: 'ben-001',
    beneficiaryCode: 'UP-2026-0001',
    beneficiaryName: 'María Elena Rivas Palacios',
    beneficiaryMunicipality: 'Apartadó',
    attentionTypeId: 'kit_alimentos',
    attentionTypeLabel: 'Kit Alimentario Familiar',
    date: '2026-02-15',
    quantity: '1 paquete nutricional para 4 personas',
    responsibleOrg: 'COOPI - Cooperazione Internazionale',
    referral: 'Ninguna / Atención directa',
    notes: 'Entrega prioritaria a jefa de hogar con 3 menores a cargo en barrio Obrero.',
    type: 'attention'
  },
  {
    id: 'att-002',
    beneficiaryId: 'ben-001',
    beneficiaryCode: 'UP-2026-0001',
    beneficiaryName: 'María Elena Rivas Palacios',
    beneficiaryMunicipality: 'Apartadó',
    attentionTypeId: 'atencion_psicosocial',
    attentionTypeLabel: 'Atención Psicosocial Individual / Familiar',
    date: '2026-03-02',
    quantity: '1 sesión terapéutica y primeros auxilios psicológicos',
    responsibleOrg: 'HIAS Colombia',
    referral: 'Hospital Local (Apartadó)',
    notes: 'Acompañamiento emocional por duelo migratorio y contención de estrés agudo.',
    type: 'attention'
  },
  {
    id: 'att-003',
    beneficiaryId: 'ben-002',
    beneficiaryCode: 'UP-2026-0002',
    beneficiaryName: 'Carlos Andrés Palacios Córdoba',
    beneficiaryMunicipality: 'Turbo',
    attentionTypeId: 'capital_semilla',
    attentionTypeLabel: 'Entrega de Capital Semilla e Insumos',
    date: '2026-02-20',
    quantity: 'Dotación de kit de herramientas menores y materia prima',
    responsibleOrg: 'Fondazione L’Albero della Vita',
    referral: 'SENA (Formación Técnica)',
    notes: 'Fortalecimiento de iniciativa productiva en taller de carpintería barrial.',
    type: 'attention'
  },
  {
    id: 'att-004',
    beneficiaryId: 'ben-003',
    beneficiaryCode: 'UP-2026-0003',
    beneficiaryName: 'Luz Dary Hinestroza Moreno',
    beneficiaryMunicipality: 'Necoclí',
    attentionTypeId: 'kit_higiene',
    attentionTypeLabel: 'Kit de Higiene y Dignidad',
    date: '2026-03-06',
    quantity: '1 kit individual de aseo y dignidad para mujer gestante',
    responsibleOrg: 'COOPI - Cooperazione Internazionale',
    referral: 'Defensoría del Pueblo (Regional Urabá)',
    notes: 'Entrega inmediata en punto de atención de playa en tránsito hacia frontera.',
    type: 'attention'
  }
];

const INITIAL_FOLLOWUPS = [
  {
    id: 'fol-001',
    beneficiaryId: 'ben-001',
    beneficiaryCode: 'UP-2026-0001',
    beneficiaryName: 'María Elena Rivas Palacios',
    beneficiaryMunicipality: 'Apartadó',
    date: '2026-03-10',
    status: 'mejora',
    observation: 'La familia muestra mayor estabilidad alimentaria. Sus hijos asisten a la escuela.',
    pendingAction: 'Verificar asistencia al taller de medios de vida del próximo ciclo.',
    nextContactDate: '2026-09-26', // Al día (Verde)
    responsibleStaff: 'Trabajadora Social Sede Apartadó',
    type: 'followup'
  },
  {
    id: 'fol-002',
    beneficiaryId: 'ben-002',
    beneficiaryCode: 'UP-2026-0002',
    beneficiaryName: 'Carlos Andrés Palacios Córdoba',
    beneficiaryMunicipality: 'Turbo',
    date: '2026-03-14',
    status: 'estable',
    observation: 'El taller está operando pero requiere apoyo en manejo de costos y facturación.',
    pendingAction: 'Visita de seguimiento técnico y entrega de balance financiero.',
    nextContactDate: '2026-09-20', // Próximo en 3 días (Ámbar)
    responsibleStaff: 'Facilitador Económico FADV',
    type: 'followup'
  },
  {
    id: 'fol-003',
    beneficiaryId: 'ben-003',
    beneficiaryCode: 'UP-2026-0003',
    beneficiaryName: 'Luz Dary Hinestroza Moreno',
    beneficiaryMunicipality: 'Necoclí',
    date: '2026-03-12',
    status: 'alerta',
    observation: 'Madre en estado de gestación sin controles prenatales vigentes y sin red de apoyo en Necoclí.',
    pendingAction: 'URGENTE: Remitir a brigada de salud de Humanity & Inclusion y coordinar con Personería.',
    nextContactDate: '2026-09-12', // Vencido (Rojo Alerta Crítica)
    responsibleStaff: 'Oficial de Protección Necoclí',
    type: 'followup'
  }
];

class AttentionRepository {
  constructor() {
    this.init();
  }

  init() {
    const existingAttentions = storageAdapter.get(ATTENTIONS_STORAGE_KEY);
    if (!existingAttentions || !Array.isArray(existingAttentions) || existingAttentions.length === 0) {
      storageAdapter.set(ATTENTIONS_STORAGE_KEY, INITIAL_ATTENTIONS);
    }

    const existingFollowups = storageAdapter.get(FOLLOWUPS_STORAGE_KEY);
    if (!existingFollowups || !Array.isArray(existingFollowups) || existingFollowups.length === 0) {
      storageAdapter.set(FOLLOWUPS_STORAGE_KEY, INITIAL_FOLLOWUPS);
    }
  }

  getAttentions() {
    return storageAdapter.get(ATTENTIONS_STORAGE_KEY) || [];
  }

  getFollowUps() {
    return storageAdapter.get(FOLLOWUPS_STORAGE_KEY) || [];
  }

  getAllEvents() {
    const attentions = this.getAttentions();
    const followups = this.getFollowUps();
    return [...attentions, ...followups].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getByBeneficiaryId(beneficiaryId) {
    const all = this.getAllEvents();
    return all.filter(e => e.beneficiaryId === beneficiaryId);
  }

  createAttention(data) {
    const attentions = this.getAttentions();
    const newAttention = {
      id: `att-${Date.now()}`,
      beneficiaryId: data.beneficiaryId,
      beneficiaryCode: data.beneficiaryCode || 'UP-2026-0000',
      beneficiaryName: data.beneficiaryName,
      beneficiaryMunicipality: data.beneficiaryMunicipality || 'Apartadó',
      attentionTypeId: data.attentionTypeId,
      attentionTypeLabel: data.attentionTypeLabel || 'Atención General',
      date: data.date || new Date().toISOString().split('T')[0],
      quantity: data.quantity || '1 unidad / sesión',
      responsibleOrg: data.responsibleOrg || 'Equipo URABÁ-PAÍS',
      referral: data.referral || 'Ninguna / Atención directa',
      notes: data.notes || '',
      type: 'attention',
      createdAt: new Date().toISOString()
    };

    const updated = [newAttention, ...attentions];
    storageAdapter.set(ATTENTIONS_STORAGE_KEY, updated);
    return newAttention;
  }

  createFollowUp(data) {
    const followups = this.getFollowUps();
    const newFollowUp = {
      id: `fol-${Date.now()}`,
      beneficiaryId: data.beneficiaryId,
      beneficiaryCode: data.beneficiaryCode || 'UP-2026-0000',
      beneficiaryName: data.beneficiaryName,
      beneficiaryMunicipality: data.beneficiaryMunicipality || 'Apartadó',
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'estable',
      observation: data.observation || '',
      pendingAction: data.pendingAction || '',
      nextContactDate: data.nextContactDate || '',
      responsibleStaff: data.responsibleStaff || 'Funcionario Territorial',
      type: 'followup',
      createdAt: new Date().toISOString()
    };

    const updated = [newFollowUp, ...followups];
    storageAdapter.set(FOLLOWUPS_STORAGE_KEY, updated);
    return newFollowUp;
  }

  resetData() {
    storageAdapter.set(ATTENTIONS_STORAGE_KEY, INITIAL_ATTENTIONS);
    storageAdapter.set(FOLLOWUPS_STORAGE_KEY, INITIAL_FOLLOWUPS);
    return true;
  }
}

export const attentionRepository = new AttentionRepository();
