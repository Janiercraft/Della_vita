import React, { useState, useEffect } from 'react';
import { Modal, Alert } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input, Select } from '../../../shared/components/Input';
import { BeneficiaryAutocomplete } from '../../../shared/components/BeneficiaryAutocomplete';
import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository';
import { PROGRAMS_CATALOG, ENROLLMENT_STATUSES, checkDuplicateEnrollment } from '../../../core/domain/programRules';
import { AlertCircle, FolderPlus, Info } from 'lucide-react';

export function ProgramEnrollModal({
  isOpen,
  onClose,
  onEnroll,
  existingEnrollments = [],
  preselectedBeneficiaryId = null
}) {
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    programId: PROGRAMS_CATALOG[0]?.id || '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'inscrito',
    notes: ''
  });
  const [duplicateWarning, setDuplicateWarning] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allBeneficiaries = beneficiaryRepository.getAll();
      setBeneficiariesList(allBeneficiaries);

      const initialBenId = preselectedBeneficiaryId || '';
      const initialProgId = PROGRAMS_CATALOG[0]?.id || '';

      setFormData({
        beneficiaryId: initialBenId,
        programId: initialProgId,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'inscrito',
        notes: ''
      });

      // Validar si la combinación inicial ya existe
      if (initialBenId) {
        const dup = checkDuplicateEnrollment(initialBenId, initialProgId, existingEnrollments);
        setDuplicateWarning(dup.isEnrolled ? dup.message : '');
      } else {
        setDuplicateWarning('');
      }
    }
  }, [isOpen, preselectedBeneficiaryId, existingEnrollments]);

  const handleSelectBeneficiary = (ben) => {
    const benId = ben ? ben.id : '';
    setFormData(prev => ({ ...prev, beneficiaryId: benId }));

    if (benId) {
      const dup = checkDuplicateEnrollment(benId, formData.programId, existingEnrollments);
      setDuplicateWarning(dup.isEnrolled ? dup.message : '');
    } else {
      setDuplicateWarning('');
    }
  };

  const handleClearBeneficiary = () => {
    setFormData(prev => ({ ...prev, beneficiaryId: '' }));
    setDuplicateWarning('');
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === 'beneficiaryId' || name === 'programId') {
      const dup = checkDuplicateEnrollment(updated.beneficiaryId, updated.programId, existingEnrollments);
      setDuplicateWarning(dup.isEnrolled ? dup.message : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.beneficiaryId) {
      alert('Por favor seleccione un beneficiario.');
      return;
    }

    if (!formData.programId) {
      alert('Por favor seleccione un programa.');
      return;
    }

    if (duplicateWarning) {
      alert(duplicateWarning);
      return;
    }

    const selectedBen = beneficiariesList.find(b => b.id === formData.beneficiaryId);
    if (!selectedBen) {
      alert('Beneficiario inválido.');
      return;
    }

    const docDisplay = selectedBen.documentType === 'SD'
      ? 'Sin documento / En trámite'
      : `${selectedBen.documentType}: ${selectedBen.documentNumber || 'N/D'}`;

    onEnroll({
      beneficiaryId: selectedBen.id,
      beneficiaryCode: selectedBen.internalCode,
      beneficiaryName: selectedBen.fullName,
      beneficiaryDoc: docDisplay,
      beneficiaryMunicipality: selectedBen.municipality,
      programId: formData.programId,
      enrollmentDate: formData.enrollmentDate,
      status: formData.status,
      notes: formData.notes
    });
  };

  const programOptions = PROGRAMS_CATALOG.map(p => ({
    value: p.id,
    label: `[${p.code}] ${p.name} - Línea: ${p.lineName}`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Beneficiario a Programa o Proyecto"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={FolderPlus}
            onClick={handleSubmit}
            disabled={!!duplicateWarning || !formData.beneficiaryId}
          >
            Vincular al Programa
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {duplicateWarning && (
          <div
            style={{
              padding: '1rem 1.15rem',
              backgroundColor: '#FEF2F2',
              border: '2px solid #EF4444',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              color: '#991B1B',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#7F1D1D', display: 'block' }}>
                Vinculación activa existente:
              </strong>
              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#991B1B', lineHeight: 1.4 }}>
                {duplicateWarning}
              </p>
            </div>
          </div>
        )}

        <BeneficiaryAutocomplete
          beneficiaries={beneficiariesList}
          selectedId={formData.beneficiaryId}
          onSelect={handleSelectBeneficiary}
          onClear={handleClearBeneficiary}
          label="Beneficiario a vincular"
          required
          helperText="Escriba para buscar en tiempo real por nombre, código UP-2026 o documento."
        />

        <div className="form-group">
          <Select
            label="Programa o Proyecto URABÁ-PAÍS"
            name="programId"
            value={formData.programId}
            onChange={handleFieldChange}
            options={programOptions}
            required
          />
        </div>

        <div className="form-grid">
          <div className="col-6">
            <Input
              label="Fecha de vinculación"
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleFieldChange}
              required
            />
          </div>
          <div className="col-6">
            <Select
              label="Estado inicial de participación"
              name="status"
              value={formData.status}
              onChange={handleFieldChange}
              options={ENROLLMENT_STATUSES}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <label className="form-label">Observaciones o Justificación de Ingreso</label>
          <textarea
            name="notes"
            rows={3}
            className="form-control"
            placeholder="Ej. Priorizada para ayuda humanitaria urgente por ser jefa de hogar con menores a cargo..."
            value={formData.notes}
            onChange={handleFieldChange}
          />
        </div>
      </form>
    </Modal>
  );
}
