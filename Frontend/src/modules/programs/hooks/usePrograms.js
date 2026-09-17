import { useState, useEffect, useCallback, useMemo } from 'react';
import { programRepository } from '../services/programRepository';
import { PROGRAMS_CATALOG } from '../../../core/domain/programRules';

export function usePrograms() {
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadEnrollments = useCallback(() => {
    const list = programRepository.getAllEnrollments();
    setEnrollments(list);
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

  const enrollBeneficiary = useCallback((enrollmentData) => {
    try {
      const created = programRepository.createEnrollment(enrollmentData);
      loadEnrollments();
      setFeedbackMessage({
        type: 'success',
        text: `Beneficiario vinculado exitosamente a "${created.programName}".`
      });
      setIsEnrollModalOpen(false);
      return { success: true, enrollment: created };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const changeEnrollmentStatus = useCallback((enrollmentId, newStatus, notes) => {
    try {
      const updated = programRepository.updateEnrollmentStatus(enrollmentId, newStatus, notes);
      loadEnrollments();
      setFeedbackMessage({
        type: 'success',
        text: `Estado actualizado a "${newStatus.toUpperCase()}" para ${updated.beneficiaryName}.`
      });
      setIsStatusModalOpen(false);
      setSelectedEnrollment(null);
      return { success: true, enrollment: updated };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const removeEnrollment = useCallback((enrollmentId) => {
    try {
      programRepository.deleteEnrollment(enrollmentId);
      loadEnrollments();
      setFeedbackMessage({ type: 'info', text: 'Vinculación eliminada del sistema.' });
      return { success: true };
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message });
      return { success: false, error: err.message };
    }
  }, [loadEnrollments]);

  const resetProgramsData = useCallback(() => {
    programRepository.resetData();
    loadEnrollments();
    setFeedbackMessage({ type: 'info', text: 'Datos de programas restaurados a la muestra de prueba.' });
  }, [loadEnrollments]);

  const openStatusModal = useCallback((enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsStatusModalOpen(true);
  }, []);

  return {
    enrollments,
    filteredEnrollments,
    programsCatalog: PROGRAMS_CATALOG,
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
