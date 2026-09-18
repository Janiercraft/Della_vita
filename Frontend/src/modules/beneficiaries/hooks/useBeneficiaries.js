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

  const loadBeneficiaries = useCallback(async () => {
    try {
      const list = await beneficiaryRepository.getAll();
      setBeneficiaries(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Lista filtrada en tiempo real (por texto, municipio y tipo de documento)
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaryRepository.searchInList(beneficiaries, searchQuery, municipalityFilter, documentTypeFilter);
  }, [searchQuery, municipalityFilter, documentTypeFilter, beneficiaries]);

  // Verificación reactiva de duplicados (se usa en el formulario mientras el usuario tipea)
  const verifyDuplicate = useCallback((candidateData, currentId = null) => {
    return checkDuplicateBeneficiary(candidateData, beneficiaries, currentId);
  }, [beneficiaries]);

  // Guardar (Crear o Actualizar)
  const saveBeneficiary = useCallback(async (formData) => {
    try {
      let targetBeneficiary = null;
      if (editingBeneficiary) {
        targetBeneficiary = await beneficiaryRepository.update(editingBeneficiary.id, formData);
        setFeedbackMessage({ type: 'success', text: `Beneficiario ${targetBeneficiary.fullName || targetBeneficiary.firstName} actualizado exitosamente.` });
      } else {
        targetBeneficiary = await beneficiaryRepository.create(formData);
        setFeedbackMessage({ type: 'success', text: `Beneficiario ${targetBeneficiary.fullName || targetBeneficiary.firstName} registrado con código ${targetBeneficiary.internalCode}.` });
      }

      // Sincronizar el núcleo familiar con PostgreSQL/API: altas y desvinculaciones.
      const miembrosFormulario = formData.familyMembers || [];
      if (editingBeneficiary) {
        const idsActuales = new Set(
          miembrosFormulario
            .filter((m) => !String(m.id || '').startsWith('fam-temp'))
            .map((m) => String(m.id))
        );
        const eliminados = (editingBeneficiary.familyMembers || [])
          .filter((m) => m.id && !idsActuales.has(String(m.id)));

        for (const member of eliminados) {
          await beneficiaryRepository.removeFamilyMember(targetBeneficiary.id, member.id);
        }
      }

      for (const member of miembrosFormulario) {
        if (String(member.id || '').startsWith('fam-temp')) {
          await beneficiaryRepository.addFamilyMember(targetBeneficiary.id, member);
        }
      }

      await loadBeneficiaries();
      if (selectedBeneficiary && selectedBeneficiary.id === (editingBeneficiary ? editingBeneficiary.id : targetBeneficiary.id)) {
         setSelectedBeneficiary(targetBeneficiary);
      }
      setIsFormOpen(false);
      setEditingBeneficiary(null);
      return { success: true, beneficiary: targetBeneficiary };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [editingBeneficiary, loadBeneficiaries, selectedBeneficiary]);

  const changeBeneficiaryStatus = useCallback(async (id, activo, motivo) => {
    try {
      const updated = await beneficiaryRepository.changeStatus(id, activo, motivo);
      await loadBeneficiaries();
      if (selectedBeneficiary && selectedBeneficiary.id === id) {
        setSelectedBeneficiary(updated);
      }
      setFeedbackMessage({ type: 'success', text: `Beneficiario ${activo ? 'activado' : 'inactivado'} exitosamente.` });
      return { success: true, beneficiary: updated };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadBeneficiaries, selectedBeneficiary]);

  // Gestión de miembros del núcleo familiar
  const addFamilyMember = useCallback(async (beneficiaryId, memberData) => {
    try {
      const updated = await beneficiaryRepository.addFamilyMember(beneficiaryId, memberData);
      await loadBeneficiaries();
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

  const removeFamilyMember = useCallback(async (beneficiaryId, memberId) => {
    try {
      const updated = await beneficiaryRepository.removeFamilyMember(beneficiaryId, memberId);
      await loadBeneficiaries();
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

  const resetAllData = useCallback(async () => {
    await beneficiaryRepository.resetData();
    await loadBeneficiaries();
    setFeedbackMessage({ type: 'info', text: 'Datos recargados desde el backend.' });
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
    changeBeneficiaryStatus,
    addFamilyMember,
    removeFamilyMember,
    openCreateModal,
    openEditModal,
    openDetailModal,
    resetAllData
  };
}
