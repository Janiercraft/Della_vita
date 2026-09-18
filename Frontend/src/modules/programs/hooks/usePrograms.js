import { useState, useEffect, useCallback, useMemo } from 'react';
import { programRepository } from '../services/programRepository';

export function usePrograms() {
  const [enrollments, setEnrollments] = useState([]);
  const [programsCatalog, setProgramsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const list = await programRepository.load();
      setEnrollments(list);
      setProgramsCatalog(programRepository.getProgramsCatalog());
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'No se pudieron cargar programas' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const filteredEnrollments = useMemo(() => {
    return programRepository.searchEnrollments(
      searchQuery,
      lineFilter,
      statusFilter,
      municipalityFilter
    );
  }, [searchQuery, lineFilter, statusFilter, municipalityFilter, enrollments]);

  const enrollBeneficiary = useCallback(async (enrollmentData) => {
    try {
      const created = await programRepository.createEnrollment(enrollmentData);
      await loadEnrollments();
      setFeedbackMessage({
        type: 'success',
        text: `Beneficiario vinculado a "${created.programName}".`
      });
      setIsEnrollModalOpen(false);
      return { success: true, enrollment: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const changeEnrollmentStatus = useCallback(async (enrollmentId, newStatus, notes) => {
    try {
      const updated = await programRepository.updateEnrollmentStatus(enrollmentId, newStatus, notes);
      await loadEnrollments();
      setFeedbackMessage({
        type: 'success',
        text: `Estado actualizado a "${String(newStatus).toUpperCase()}" para ${updated.beneficiaryName}.`
      });
      setIsStatusModalOpen(false);
      setSelectedEnrollment(null);
      return { success: true, enrollment: updated };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const removeEnrollment = useCallback(async (enrollmentId) => {
    try {
      await programRepository.deleteEnrollment(enrollmentId);
      await loadEnrollments();
      setFeedbackMessage({ type: 'info', text: 'Vinculación desactivada.' });
      return { success: true };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const resetProgramsData = useCallback(async () => {
    await loadEnrollments();
    setFeedbackMessage({ type: 'info', text: 'Programas recargados desde el backend.' });
  }, [loadEnrollments]);

  const openStatusModal = useCallback((enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsStatusModalOpen(true);
  }, []);

  return {
    loading,
    enrollments,
    filteredEnrollments,
    programsCatalog,
    searchQuery,
    setSearchQuery,
    lineFilter,
    setLineFilter,
    statusFilter,
    setStatusFilter,
    municipalityFilter,
    setMunicipalityFilter,
    isEnrollModalOpen,
    setIsEnrollModalOpen,
    isStatusModalOpen,
    setIsStatusModalOpen,
    selectedEnrollment,
    feedbackMessage,
    setFeedbackMessage,
    enrollBeneficiary,
    changeEnrollmentStatus,
    removeEnrollment,
    resetProgramsData,
    openStatusModal
  };
}
