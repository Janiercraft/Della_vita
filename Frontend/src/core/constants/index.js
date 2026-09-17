/**
 * Constantes institucionales del Proyecto URABÁ-PAÍS
 * Co-ejecutado por COOPI, Fondazione L'Albero della Vita, HIAS y HI
 */

export const MUNICIPALITIES = [
  'Apartadó',
  'Turbo',
  'Necoclí'
];

export const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'PPT', label: 'Permiso por Protección Temporal (PPT)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'RC', label: 'Registro Civil (RC)' },
  { value: 'PAS', label: 'Pasaporte (PAS)' },
  { value: 'SD', label: 'Sin Documento / En Trámite' }
];

export const POPULATION_GROUPS = [
  'Comunidad Local',
  'Persona Migrante / Refugiada',
  'Víctima del Conflicto Armado',
  'Población Desplazada',
  'Retornado(a)'
];

export const ETHNICITIES = [
  'Afrocolombiano(a) / Afrodescendiente',
  'Indígena',
  'Mestizo(a) / Blanco(a)',
  'Palenquero(a) / Raizal',
  'Rrom / Gitano',
  'Ninguna / No aplica'
];

export const GENDERS = [
  'Femenino',
  'Masculino',
  'No binario / Diverso',
  'Prefiero no responder'
];

export const KINSHIP_TYPES = [
  'Hijo(a)',
  'Cónyuge / Pareja',
  'Madre / Padre',
  'Hermano(a)',
  'Abuelo(a)',
  'Nieto(a)',
  'Tío(a)',
  'Otro familiar / Cuidador'
];

export const INTERVENTION_LINES = [
  {
    id: 'humanitarian',
    name: 'Asistencia humanitaria y protección',
    org: 'COOPI / FADV / HIAS',
    description: 'Ayudas de emergencia, orientación en derechos, kits y protección humanitaria.'
  },
  {
    id: 'health',
    name: 'Salud y bienestar',
    org: 'HIAS / Humanity & Inclusion',
    description: 'Atención psicosocial, salud mental, salud sexual y reproductiva.'
  },
  {
    id: 'economic',
    name: 'Integración socioeconómica y cohesión social',
    org: 'L’Albero della Vita / HI',
    description: 'Formación laboral, emprendimiento inclusivo y fortalecimiento comunitario.'
  }
];

export const PARTICIPATION_STATUSES = [
  { value: 'inscrito', label: 'Inscrito', color: 'badge-warning' },
  { value: 'en_proceso', label: 'En proceso', color: 'badge-info' },
  { value: 'finalizado', label: 'Finalizado', color: 'badge-success' },
  { value: 'retirado', label: 'Retirado', color: 'badge-danger' }
];
