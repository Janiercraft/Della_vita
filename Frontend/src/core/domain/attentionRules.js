/**
 * Reglas de Dominio Puras para el Módulo 3: Atención y Seguimiento
 * Proyecto URABÁ-PAÍS (COOPI, FADV, HIAS, HI)
 */

export const ATTENTION_TYPES = [
  {
    id: 'kit_higienico_familiar',
    code: '1.1.1',
    label: '1.1.1 Kits higiénico-sanitarios familiares',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 paquete higiénico familiar completo',
    icon: 'Package'
  },
  {
    id: 'kit_dignidad',
    code: '1.1.2',
    label: '1.1.2 Kits de dignidad',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 kit individual de dignidad para mujer/joven',
    icon: 'Package'
  },
  {
    id: 'kit_alimenticio',
    code: '1.1.3',
    label: '1.1.3 Kits con productos alimenticios',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 paquete alimentario y nutricional',
    icon: 'Package'
  },
  {
    id: 'kit_bebes',
    code: '1.1.4',
    label: '1.1.4 Kits para bebés',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 dotación de higiene y cuidado infantil',
    icon: 'Heart'
  },
  {
    id: 'gestion_vbg',
    code: '1.2',
    label: '1.2 Gestiones de caso de VBG',
    category: 'protection',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 sesión especializada y activación de ruta',
    icon: 'Shield'
  },
  {
    id: 'fondos_emergencia',
    code: '1.3',
    label: '1.3 Fondos de emergencias',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 apoyo económico extraordinario para protección',
    icon: 'Briefcase'
  },
  {
    id: 'unidad_movil',
    code: '1.4',
    label: '1.4 Unidad móvil para identificación a la respuesta',
    category: 'humanitarian',
    categoryLabel: 'Resultado 1 (R1)',
    defaultUnits: '1 jornada comunitaria territorial',
    icon: 'Truck'
  },
  {
    id: 'centro_salud',
    code: '2.1',
    label: '2.1 Rehabilitación de centro de salud local y equipamiento',
    category: 'health',
    categoryLabel: 'Resultado 2 (R2)',
    defaultUnits: '1 intervención de dotación / infraestructura básica',
    icon: 'Stethoscope'
  },
  {
    id: 'formacion_capacidades',
    code: 'R3.1',
    label: 'Formación y fortalecimiento de capacidades',
    category: 'economic',
    categoryLabel: 'Resultado 3 (R3)',
    defaultUnits: '1 ciclo formativo certificado',
    icon: 'GraduationCap'
  },
  {
    id: 'formacion_empleabilidad',
    code: 'R3.2',
    label: 'Formación para empleabilidad y competencias',
    category: 'economic',
    categoryLabel: 'Resultado 3 (R3)',
    defaultUnits: '1 taller técnico de inserción socioeconómica',
    icon: 'GraduationCap'
  }
];

export const PARTNER_ORGANIZATIONS = [
  'COOPI - Cooperazione Internazionale',
  'Fondazione L’Albero della Vita',
  'HIAS Colombia',
  'Humanity & Inclusion (HI)',
  'Alcaldía Municipal / Mesa Local'
];

export const REFERRAL_DESTINATIONS = [
  'Ninguna / Atención directa',
  'Hospital Local (Apartadó / Turbo / Necoclí)',
  'Personería Municipal',
  'Defensoría del Pueblo (Regional Urabá)',
  'Migración Colombia - Sede Urabá',
  'ICBF (Protección de Niñez y Adolescencia)',
  'SENA (Formación Técnica)'
];

export const FOLLOWUP_STATUSES = [
  {
    value: 'mejora',
    label: 'Mejora Progresiva',
    description: 'El beneficiario muestra avances positivos en sus condiciones de vida o salud.',
    badgeClass: 'badge-success',
    severity: 'low'
  },
  {
    value: 'estable',
    label: 'Estable / En Proceso',
    description: 'Situación controlada; continúa en seguimiento según cronograma regular.',
    badgeClass: 'badge-info',
    severity: 'medium'
  },
  {
    value: 'alerta',
    label: 'En Riesgo / Alerta Urgente',
    description: 'Riesgo de desnutrición, violencia basada en género o vulnerabilidad extrema.',
    badgeClass: 'badge-danger',
    severity: 'high'
  },
  {
    value: 'reubicado',
    label: 'Reubicación Territorial',
    description: 'Cambio de domicilio o traslado entre Apartadó, Turbo, Necoclí u otro departamento.',
    badgeClass: 'badge-warning',
    severity: 'medium'
  },
  {
    value: 'desercion',
    label: 'Deserción / Pérdida de Contacto',
    description: 'No asiste a convocatorias ni responde a llamadas o visitas domiciliarias.',
    badgeClass: 'badge-secondary',
    severity: 'high'
  }
];

/**
 * Calcula el estado del semáforo para la fecha del próximo contacto
 * @param {string} nextContactDate - Fecha en formato YYYY-MM-DD
 * @param {string} currentStatus - Estado del seguimiento (ej. 'alerta', 'mejora')
 * @returns {object} { level: 'danger'|'warning'|'good'|'none', label: string, color: string, bg: string, border: string }
 */
export function getFollowUpTrafficLight(nextContactDate, currentStatus = '') {
  if (currentStatus === 'alerta') {
    return {
      level: 'danger',
      label: 'Alerta Roja Urgente',
      color: '#991B1B',
      bg: '#FEF2F2',
      border: '#EF4444',
      badgeText: 'Alerta Crítica'
    };
  }

  if (!nextContactDate) {
    return {
      level: 'none',
      label: 'Sin programar',
      color: '#4B635F',
      bg: '#F0F4F3',
      border: '#D2DFDC',
      badgeText: 'Sin Fecha'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = nextContactDate.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      level: 'danger',
      label: `Vencido hace ${Math.abs(diffDays)} día(s)`,
      color: '#991B1B',
      bg: '#FEF2F2',
      border: '#EF4444',
      badgeText: `Vencido (-${Math.abs(diffDays)}d)`
    };
  }

  if (diffDays === 0) {
    return {
      level: 'warning',
      label: '¡Contacto programado para hoy!',
      color: '#9A3412',
      bg: '#FFF7ED',
      border: '#F97316',
      badgeText: '¡Hoy!'
    };
  }

  if (diffDays <= 7) {
    return {
      level: 'warning',
      label: `Próximo en ${diffDays} día(s)`,
      color: '#92400E',
      bg: '#FEF7EA',
      border: '#F59E0B',
      badgeText: `Próximo (${diffDays}d)`
    };
  }

  return {
    level: 'good',
    label: `Programado para el ${nextContactDate} (${diffDays} días)`,
    color: '#065F46',
    bg: '#E8F7F1',
    border: '#10B981',
    badgeText: `Al día (${diffDays}d)`
  };
}
