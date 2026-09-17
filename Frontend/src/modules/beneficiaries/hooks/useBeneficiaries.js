import { useState, useEffect, useCallback, useMemo } from 'react';
import { beneficiaryRepository } from '../services/beneficiaryRepository';
import { checkDuplicateBeneficiary } from '../../../core/domain/beneficiaryRules';

export function useBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadBeneficiaries = useCallback(() => {
    const list = beneficiaryRepository.getAll();
    setBeneficiaries(list);
  }, []);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Lista filtrada en tiempo real (por texto, municipio y tipo de documento)
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaryRepository.search(searchQuery, municipalityFilter, documentTypeFilter);
  }, [searchQuery, municipalityFilter, documentTypeFilter, beneficiaries]);

  // Verificación reactiva de duplicados (se usa en el formulario mientras el usuario tipea)
  const verifyDuplicate = useCallback((candidateData, currentId = null) => {
    return checkDuplicateBeneficiary(candidateData, beneficiaries, currentId);
  }, [beneficiaries]);

  // Guardar (Crear o Actualizar)
  const saveBeneficiary = useCallback((formData) => {
    try {
      if (editingBeneficiary) {
        const updated = beneficiaryRepository.update(editingBeneficiary.id, formData);
        loadBeneficiaries();
        setFeedbackMessage({ type: 'success', text: `Beneficiario ${updated.fullName} actualizado exitosamente.` });
        if (selectedBeneficiary && selectedBeneficiary.id === updated.id) {
          setSelectedBeneficiary(updated);
        }
        setIsFormOpen(false);
        setEditingBeneficiary(null);
        return { success: true, beneficiary: updated };
      } else {
        const created = beneficiaryRepository.create(formData);
        loadBeneficiaries();
        setFeedbackMessage({ type: 'success', text: `Beneficiario ${created.fullName} registrado con código ${created.internalCode}.` });
        setIsFormOpen(false);
        return { success: true, beneficiary: created };
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [editingBeneficiary, loadBeneficiaries, selectedBeneficiary]);

  // Gestión de miembros del núcleo familiar
  const addFamilyMember = useCallback((beneficiaryId, memberData) => {
    try {
      const updated = beneficiaryRepository.addFamilyMember(beneficiaryId, memberData);
      loadBeneficiaries();
      if (selectedBeneficiary && selectedBeneficiary.id === beneficiaryId) {
        setSelectedBeneficiary(updated);
      }
      setFeedbackMessage({ type: 'success', text: 'Integrante familiar añadido con éxito.' });
      return { success: true };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadBeneficiaries, selectedBeneficiary]);

  const removeFamilyMember = useCallback((beneficiaryId, memberId) => {
    try {
      const updated = beneficiaryRepository.removeFamilyMember(beneficiaryId, memberId);
      loadBeneficiaries();
      if (selectedBeneficiary && selectedBeneficiary.id === beneficiaryId) {
        setSelectedBeneficiary(updated);
      }
      setFeedbackMessage({ type: 'info', text: 'Integrante familiar removido.' });
      return { success: true };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadBeneficiaries, selectedBeneficiary]);

  const openCreateModal = useCallback(() => {
    setEditingBeneficiary(null);
    setIsFormOpen(true);
  }, []);

  const openEditModal = useCallback((beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setIsFormOpen(true);
  }, []);

  const openDetailModal = useCallback((beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDetailOpen(true);
  }, []);

  const resetAllData = useCallback(() => {
    beneficiaryRepository.resetData();
    loadBeneficiaries();
    setFeedbackMessage({ type: 'info', text: 'Datos restaurados a la muestra inicial de Urabá-País.' });
  }, [loadBeneficiaries]);

  return {
    beneficiaries,
    filteredBeneficiaries,
    searchQuery,
    setSearchQuery,
    municipalityFilter,
    setMunicipalityFilter,
    documentTypeFilter,
    setDocumentTypeFilter,
    selectedBeneficiary,
    isFormOpen,
    setIsFormOpen,
    isDetailOpen,
    setIsDetailOpen,
    editingBeneficiary,
    feedbackMessage,
    setFeedbackMessage,
    verifyDuplicate,
    saveBeneficiary,
    addFamilyMember,
    removeFamilyMember,
    openCreateModal,
    openEditModal,
    openDetailModal,
    resetAllData
  };
}
