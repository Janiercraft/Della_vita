import { useState, useEffect, useMemo, useCallback } from 'react';
import { attentionRepository } from '../services/attentionRepository';
import { getFollowUpTrafficLight } from '../../../core/domain/attentionRules';
import { textMatches } from '../../../core/utils/textUtils';

export function useAttentions() {
  const [attentions, setAttentions] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'attentions' | 'followups' | 'urgent'
  const [searchQuery, setSearchQuery] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadData = useCallback(() => {
    setAttentions(attentionRepository.getAttentions());
    setFollowups(attentionRepository.getFollowUps());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lista combinada de todos los eventos
  const allEvents = useMemo(() => {
    const list = [...attentions, ...followups];
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attentions, followups]);

  // Métricas calculadas en tiempo real
  const metrics = useMemo(() => {
    const totalAttentions = attentions.length;
    const totalFollowUps = followups.length;

    let urgentCount = 0;
    let upcomingCount = 0;

    followups.forEach(f => {
      const light = getFollowUpTrafficLight(f.nextContactDate, f.status);
      if (light.level === 'danger') urgentCount++;
      if (light.level === 'warning') upcomingCount++;
    });

    return {
      totalAttentions,
      totalFollowUps,
      urgentCount,
      upcomingCount,
      totalEvents: totalAttentions + totalFollowUps
    };
  }, [attentions, followups]);

  // Filtrado reactivo multicriterio e insensible a tildes
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Filtro por pestaña
      if (activeTabFilter === 'attentions' && event.type !== 'attention') return false;
      if (activeTabFilter === 'followups' && event.type !== 'followup') return false;
      if (activeTabFilter === 'urgent') {
        if (event.type !== 'followup') return false;
        const light = getFollowUpTrafficLight(event.nextContactDate, event.status);
        if (light.level !== 'danger') return false;
      }

      // Filtro por municipio
      if (municipalityFilter && event.beneficiaryMunicipality !== municipalityFilter) {
        return false;
      }

      // Búsqueda en tiempo real
      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim();
      const matchName = textMatches(event.beneficiaryName, q);
      const matchCode = textMatches(event.beneficiaryCode, q);
      const matchMun = textMatches(event.beneficiaryMunicipality, q);
      const matchNotes = textMatches(event.notes || event.observation || event.pendingAction, q);
      const matchType = textMatches(event.attentionTypeLabel || event.status, q);
      const matchOrg = textMatches(event.responsibleOrg || event.responsibleStaff, q);

      return matchName || matchCode || matchMun || matchNotes || matchType || matchOrg;
    });
  }, [allEvents, activeTabFilter, municipalityFilter, searchQuery]);

  const recordAttention = useCallback((data) => {
    try {
      const created = attentionRepository.createAttention(data);
      loadData();
      setFeedbackMessage({
        type: 'success',
        text: `Atención "${created.attentionTypeLabel}" registrada exitosamente para ${created.beneficiaryName}.`
      });
      setIsAttentionModalOpen(false);
      return { success: true, item: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadData]);

  const recordFollowUp = useCallback((data) => {
    try {
      const created = attentionRepository.createFollowUp(data);
      loadData();
      setFeedbackMessage({
        type: 'success',
        text: `Seguimiento registrado para ${created.beneficiaryName} con estado "${created.status}".`
      });
      setIsFollowUpModalOpen(false);
      return { success: true, item: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadData]);

  const resetAllData = useCallback(() => {
    attentionRepository.resetData();
    loadData();
    setFeedbackMessage({
      type: 'info',
      text: 'Muestra de atenciones y seguimientos de Urabá restaurada exitosamente.'
    });
  }, [loadData]);

  return {
    events: allEvents,
    filteredEvents,
    metrics,
    activeTabFilter,
    setActiveTabFilter,
    searchQuery,
    setSearchQuery,
    municipalityFilter,
    setMunicipalityFilter,
    isAttentionModalOpen,
    setIsAttentionModalOpen,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    feedbackMessage,
    setFeedbackMessage,
    recordAttention,
    recordFollowUp,
    resetAllData
  };
}
