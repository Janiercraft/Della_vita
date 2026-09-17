import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportRepository } from '../services/reportRepository';
import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository';

export function useReports() {
  const [activeSubTab, setActiveSubTab] = useState('profile360'); // 'profile360' (Paso 6) | 'dashboard' (Paso 7)
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadData = useCallback(() => {
    const bens = beneficiaryRepository.getAll();
    setBeneficiariesList(bens);

    const reports = reportRepository.getAggregatedReports();
    setReportsData(reports);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Perfil 360 del beneficiario seleccionado actualmente
  const profile360 = useMemo(() => {
    if (!selectedBeneficiaryId) return null;
    return reportRepository.getConsolidatedProfile360(selectedBeneficiaryId);
  }, [selectedBeneficiaryId, reportsData]);

  const handleSelectBeneficiary = useCallback((beneficiaryId) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setActiveSubTab('profile360');
  }, []);

  const handleResetAllData = useCallback(() => {
    reportRepository.resetAllDemoData();
    loadData();
    setFeedbackMessage({
      type: 'info',
      text: 'Todos los datos de los 4 módulos han sido restaurados a la muestra inicial de Urabá-País.'
    });
  }, [loadData]);

  return {
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
