/**
 * Datos ficticios de vinculaciones a programas para la demo del Proyecto URABÁ-PAÍS
 */

export const INITIAL_ENROLLMENTS = [
  {
    id: 'enr-001',
    beneficiaryId: 'ben-001',
    beneficiaryCode: 'UP-2026-0001',
    beneficiaryName: 'María Elena Rivas Palacios',
    beneficiaryDoc: 'PPT: 987654321',
    beneficiaryMunicipality: 'Apartadó',
    programId: 'prog-humanitarian-01',
    programCode: 'PR-HUM-01',
    programName: 'Ruta de Asistencia Humanitaria de Emergencia y Protección',
    lineId: 'humanitarian',
    lineName: 'Asistencia humanitaria y protección',
    enrollmentDate: '2026-02-12',
    status: 'en_proceso', // inscrito | en_proceso | finalizado | retirado
    notes: 'Priorizada por ser jefa de hogar con 2 menores a cargo.',
    createdAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'enr-002',
    beneficiaryId: 'ben-001',
    beneficiaryCode: 'UP-2026-0001',
    beneficiaryName: 'María Elena Rivas Palacios',
    beneficiaryDoc: 'PPT: 987654321',
    beneficiaryMunicipality: 'Apartadó',
    programId: 'prog-health-01',
    programCode: 'PR-SAL-01',
    programName: 'Atención Psicosocial y Salud Mental Comunitaria',
    lineId: 'health',
    lineName: 'Salud y bienestar',
    enrollmentDate: '2026-03-02',
    status: 'inscrito',
    notes: 'Remitida a grupo de apoyo psicosocial para mujeres.',
    createdAt: '2026-03-02T14:30:00.000Z'
  },
  {
    id: 'enr-003',
    beneficiaryId: 'ben-002',
    beneficiaryCode: 'UP-2026-0002',
    beneficiaryName: 'Carlos Andrés Palacios Córdoba',
    beneficiaryDoc: 'CC: 1038567890',
    beneficiaryMunicipality: 'Turbo',
    programId: 'prog-economic-01',
    programCode: 'PR-ECO-01',
    programName: 'Ruta de Emprendimiento y Medios de Vida Sostenibles',
    lineId: 'economic',
    lineName: 'Integración socioeconómica y cohesión social',
    enrollmentDate: '2026-02-18',
    status: 'en_proceso',
    notes: 'Participando en módulo de formulación de plan de negocio gastronómico.',
    createdAt: '2026-02-18T09:15:00.000Z'
  },
  {
    id: 'enr-004',
    beneficiaryId: 'ben-003',
    beneficiaryCode: 'UP-2026-0003',
    beneficiaryName: 'Luz Dary Hinestroza Moreno',
    beneficiaryDoc: 'Sin documento / En trámite',
    beneficiaryMunicipality: 'Necoclí',
    programId: 'prog-humanitarian-01',
    programCode: 'PR-HUM-01',
    programName: 'Ruta de Asistencia Humanitaria de Emergencia y Protección',
    lineId: 'humanitarian',
    lineName: 'Asistencia humanitaria y protección',
    enrollmentDate: '2026-03-05',
    status: 'inscrito',
    notes: 'Orientación inicial para trámites de documentación y ayuda alimentaria.',
    createdAt: '2026-03-05T11:00:00.000Z'
  }
];
