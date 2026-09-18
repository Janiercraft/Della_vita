/**
 * Reglas de Dominio Puras para el Módulo 4: Consultas, Ficha 360° y Reportes
 * Proyecto URABÁ-PAÍS (COOPI, FADV, HIAS, HI)
 */

import { getFollowUpTrafficLight } from './attentionRules';

/**
 * Calcula métricas agregadas garantizando la confidencialidad y sin exponer PII
 */
export function calculateAggregatedMetrics(beneficiaries = [], enrollments = [], attentions = [], followups = []) {
  const totalBeneficiaries = beneficiaries.length;
  
  // Total de personas alcanzadas (titulares + familiares)
  const totalFamilyMembers = beneficiaries.reduce((sum, b) => sum + (b.familyMembers?.length || 0), 0);
  const totalPeopleReached = totalBeneficiaries + totalFamilyMembers;

  // Desagregación territorial
  const municipalityCounts = {
    'Apartadó': 0,
    'Turbo': 0,
    'Necoclí': 0
  };

  beneficiaries.forEach(b => {
    const mun = b.municipality || 'Apartadó';
    if (municipalityCounts[mun] !== undefined) {
      municipalityCounts[mun]++;
    } else {
      municipalityCounts['Apartadó']++;
    }
  });

  // Desagregación por grupo poblacional
  const populationGroups = {
    'Población Migrante y Refugiada': 0,
    'Víctima del Conflicto Armado': 0,
    'Comunidad de Acogida / Local': 0,
    'Población en Retorno': 0
  };

  beneficiaries.forEach(b => {
    const group = b.populationGroup || 'Comunidad de Acogida / Local';
    if (populationGroups[group] !== undefined) {
      populationGroups[group]++;
    } else {
      populationGroups['Comunidad de Acogida / Local']++;
    }
  });

  // Personas con condición de discapacidad
  const withDisabilityCount = beneficiaries.filter(b => b.hasDisability).length;
  const disabilityPercentage = totalBeneficiaries > 0 
    ? Math.round((withDisabilityCount / totalBeneficiaries) * 100) 
    : 0;

  // Personas sin documento (SD)
  const undocumentedCount = beneficiaries.filter(b => b.documentType === 'SD').length;

  // Participación por línea de intervención (Módulo 2)
  const linesBreakdown = {
    'humanitarian': { label: 'Asistencia Humanitaria', count: 0, target: 6700, color: '#178358', bg: '#E8F7F1' },
    'health': { label: 'Salud y Bienestar', count: 0, target: 2911, color: '#1D6FBA', bg: '#EBF3FC' },
    'economic': { label: 'Integración Socioeconómica', count: 0, target: 1836, color: '#0B7E7F', bg: '#E5F6F6' }
  };

  enrollments.forEach(enr => {
    const progId = enr.programId || '';
    if (progId.includes('hum')) linesBreakdown.humanitarian.count++;
    else if (progId.includes('sal')) linesBreakdown.health.count++;
    else if (progId.includes('eco')) linesBreakdown.economic.count++;
    else linesBreakdown.humanitarian.count++;
  });

  // Atenciones por tipo (Módulo 3)
  const attentionCategories = {
    'Kits Nutricionales y Alimentarios': 0,
    'Kits de Higiene y Dignidad': 0,
    'Atención Psicosocial y Salud Mental': 0,
    'Consultas Médicas y Valoración': 0,
    'Capital Semilla y Emprendimiento': 0,
    'Capacitación y Asesoría Legal': 0
  };

  attentions.forEach(att => {
    const typeId = att.attentionTypeId || '';
    if (typeId === 'kit_alimentos') attentionCategories['Kits Nutricionales y Alimentarios']++;
    else if (typeId === 'kit_higiene') attentionCategories['Kits de Higiene y Dignidad']++;
    else if (typeId === 'atencion_psicosocial') attentionCategories['Atención Psicosocial y Salud Mental']++;
    else if (typeId === 'consulta_medica') attentionCategories['Consultas Médicas y Valoración']++;
    else if (typeId === 'capital_semilla') attentionCategories['Capital Semilla y Emprendimiento']++;
    else attentionCategories['Capacitación y Asesoría Legal']++;
  });

  // Semáforo de Seguimiento Consolidado
  let trafficLightStats = {
    urgentCount: 0,
    upcomingCount: 0,
    onTrackCount: 0,
    noDateCount: 0
  };

  followups.forEach(f => {
    const light = getFollowUpTrafficLight(f.nextContactDate, f.status);
    if (light.level === 'danger') trafficLightStats.urgentCount++;
    else if (light.level === 'warning') trafficLightStats.upcomingCount++;
    else if (light.level === 'good') trafficLightStats.onTrackCount++;
    else trafficLightStats.noDateCount++;
  });

  return {
    totalBeneficiaries,
    totalFamilyMembers,
    totalPeopleReached,
    municipalityCounts,
    populationGroups,
    withDisabilityCount,
    disabilityPercentage,
    undocumentedCount,
    totalEnrollments: enrollments.length,
    linesBreakdown,
    totalAttentions: attentions.length,
    attentionCategories,
    totalFollowUps: followups.length,
    trafficLightStats
  };
}
