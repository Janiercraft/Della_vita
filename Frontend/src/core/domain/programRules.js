/**
 * Catálogo Oficial y Reglas de Negocio para Programas y Participación (Módulo 2)
 * Proyecto URABÁ-PAÍS (Apartadó, Turbo, Necoclí)
 */

export const PROGRAMS_CATALOG = [
  {
    id: 'prog-humanitarian-01',
    lineId: 'humanitarian',
    lineName: 'Asistencia humanitaria y protección',
    code: 'PR-HUM-01',
    name: 'Ruta de Asistencia Humanitaria de Emergencia y Protección',
    leadOrg: 'COOPI / Fondazione L’Albero della Vita / HIAS',
    description: 'Orientación en derechos, protección humanitaria, kits de emergencia y apoyo a necesidades inmediatas de familias vulnerables y migrantes.',
    targetEstimated: 6700
  },
  {
    id: 'prog-health-01',
    lineId: 'health',
    lineName: 'Salud y bienestar',
    code: 'PR-SAL-01',
    name: 'Atención Psicosocial y Salud Mental Comunitaria',
    leadOrg: 'HIAS / Humanity & Inclusion (HI)',
    description: 'Acompañamiento psicosocial individual y familiar, primeros auxilios psicológicos y círculos comunitarios de sanación.',
    targetEstimated: 1800
  },
  {
    id: 'prog-health-02',
    lineId: 'health',
    lineName: 'Salud y bienestar',
    code: 'PR-SAL-02',
    name: 'Salud Sexual, Reproductiva y Prevención de VBG',
    leadOrg: 'HIAS / HI',
    description: 'Orientación médica preventiva, talleres de salud sexual y reproductiva y activación de rutas de atención en violencia basada en género.',
    targetEstimated: 1111
  },
  {
    id: 'prog-economic-01',
    lineId: 'economic',
    lineName: 'Integración socioeconómica y cohesión social',
    code: 'PR-ECO-01',
    name: 'Ruta de Emprendimiento y Medios de Vida Sostenibles',
    leadOrg: 'Fondazione L’Albero della Vita / HI',
    description: 'Capacitación en planes de negocio, capital semilla y fortalecimiento de iniciativas productivas para mujeres y jóvenes de Urabá.',
    targetEstimated: 1000
  },
  {
    id: 'prog-economic-02',
    lineId: 'economic',
    lineName: 'Integración socioeconómica y cohesión social',
    code: 'PR-ECO-02',
    name: 'Formación para la Empleabilidad e Inclusión de Discapacidad',
    leadOrg: 'Humanity & Inclusion / FADV',
    description: 'Formación en habilidades laborales técnicas, intermediación de empleo y adaptaciones inclusivas para personas con discapacidad.',
    targetEstimated: 836
  }
];

export const ENROLLMENT_STATUSES = [
  { value: 'inscrito', label: 'Inscrito', description: 'Registro completado, pendiente de inicio de actividades.' },
  { value: 'en_proceso', label: 'En proceso', description: 'Participando activamente en talleres, entregas o sesiones.' },
  { value: 'finalizado', label: 'Finalizado', description: 'Culminó con éxito la ruta de intervención prevista.' },
  { value: 'retirado', label: 'Retirado', description: 'Salida voluntaria, traslado de territorio o suspensión.' }
];

/**
 * Valida si un beneficiario ya se encuentra vinculado a un programa específico
 */
export function checkDuplicateEnrollment(beneficiaryId, programId, existingEnrollments = []) {
  const activeEnrollment = existingEnrollments.find(e => 
    e.beneficiaryId === beneficiaryId && 
    e.programId === programId &&
    (e.status === 'inscrito' || e.status === 'en_proceso')
  );

  if (activeEnrollment) {
    return {
      isEnrolled: true,
      message: `El beneficiario ya cuenta con una vinculación activa (${activeEnrollment.status.toUpperCase()}) en este programa.`
    };
  }

  return {
    isEnrolled: false,
    message: ''
  };
}
