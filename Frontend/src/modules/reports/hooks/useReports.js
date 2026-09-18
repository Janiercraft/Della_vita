import { useState, useEffect, useCallback } from 'react';
import { reportRepository } from '../services/reportRepository';
import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository';

export function useReports() {
  const [activeSubTab, setActiveSubTab] = useState('profile360');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [profile360, setProfile360] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const bens = await beneficiaryRepository.getAll();
      setBeneficiariesList(bens);
      const reports = await reportRepository.getAggregatedReports();
      setReportsData(reports);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error cargando reportes' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!selectedBeneficiaryId) {
        setProfile360(null);
        return;
      }
      const profile = await reportRepository.getConsolidatedProfile360(selectedBeneficiaryId);
      if (!cancel) setProfile360(profile);
    })();
    return () => { cancel = true; };
  }, [selectedBeneficiaryId, reportsData]);

  const handleSelectBeneficiary = useCallback((beneficiaryId) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setActiveSubTab('profile360');
  }, []);

  const handleResetAllData = useCallback(async () => {
    await reportRepository.resetAllDemoData();
    await loadData();
    setFeedbackMessage({
      type: 'info',
      text: 'Datos recargados desde el backend.'
    });
  }, [loadData]);

  return {
    loading,
    activeSubTab,
    setActiveSubTab,
    selectedBeneficiaryId,
    setSelectedBeneficiaryId,
    beneficiariesList,
    reportsData,
    profile360,
    feedbackMessage,
    setFeedbackMessage,
    handleSelectBeneficiary,
    handleResetAllData,
    refreshData: loadData
  };
}
