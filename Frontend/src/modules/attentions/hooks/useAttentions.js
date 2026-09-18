import { useState, useEffect, useMemo, useCallback } from 'react';
import { attentionRepository } from '../services/attentionRepository';
import { getFollowUpTrafficLight } from '../../../core/domain/attentionRules';
import { textMatches } from '../../../core/utils/textUtils';

export function useAttentions() {
  const [attentions, setAttentions] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attentionRepository.load();
      setAttentions(data.attentions);
      setFollowups(data.followups);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'No se pudieron cargar atenciones' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allEvents = useMemo(() => {
    return [...attentions, ...followups].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attentions, followups]);

  const metrics = useMemo(() => {
    let urgentCount = 0;
    let upcomingCount = 0;
    followups.forEach((f) => {
      const light = getFollowUpTrafficLight(f.nextContactDate, f.status);
      if (light.level === 'danger') urgentCount++;
      if (light.level === 'warning') upcomingCount++;
    });
    return {
      totalAttentions: attentions.length,
      totalFollowUps: followups.length,
      urgentCount,
      upcomingCount,
      totalEvents: attentions.length + followups.length
    };
  }, [attentions, followups]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (activeTabFilter === 'attentions' && event.type !== 'attention') return false;
      if (activeTabFilter === 'followups' && event.type !== 'followup') return false;
      if (activeTabFilter === 'urgent') {
        if (event.type !== 'followup') return false;
        if (getFollowUpTrafficLight(event.nextContactDate, event.status).level !== 'danger') return false;
      }
      if (municipalityFilter && event.beneficiaryMunicipality !== municipalityFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim();
      return textMatches(event.beneficiaryName, q)
        || textMatches(event.beneficiaryCode, q)
        || textMatches(event.beneficiaryMunicipality, q)
        || textMatches(event.notes || event.observation || event.pendingAction, q)
        || textMatches(event.attentionTypeLabel || event.status, q)
        || textMatches(event.responsibleOrg || event.responsibleStaff, q);
    });
  }, [allEvents, activeTabFilter, municipalityFilter, searchQuery]);

  const recordAttention = useCallback(async (data) => {
    try {
      const created = await attentionRepository.createAttention(data);
      await loadData();
      setFeedbackMessage({
        type: 'success',
        text: `Atención "${created.attentionTypeLabel}" registrada para ${created.beneficiaryName}.`
      });
      setIsAttentionModalOpen(false);
      return { success: true, item: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadData]);

  const recordFollowUp = useCallback(async (data) => {
    try {
      const created = await attentionRepository.createFollowUp(data);
      await loadData();
      setFeedbackMessage({
        type: 'success',
        text: `Seguimiento registrado para ${created.beneficiaryName}.`
      });
      setIsFollowUpModalOpen(false);
      return { success: true, item: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadData]);

  const resetAllData = useCallback(async () => {
    await loadData();
    setFeedbackMessage({ type: 'info', text: 'Datos de atenciones recargados desde el backend.' });
  }, [loadData]);

  return {
    loading,
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
