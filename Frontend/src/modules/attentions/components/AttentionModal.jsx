import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input, Select } from '../../../shared/components/Input';
import { BeneficiaryAutocomplete } from '../../../shared/components/BeneficiaryAutocomplete';
import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository';
import { ATTENTION_TYPES, PARTNER_ORGANIZATIONS, REFERRAL_DESTINATIONS } from '../../../core/domain/attentionRules';
import { PackagePlus } from 'lucide-react';

export function AttentionModal({
  isOpen,
  onClose,
  onSave
}) {
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    attentionTypeId: ATTENTION_TYPES[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    quantity: ATTENTION_TYPES[0]?.defaultUnits || '1 unidad',
    responsibleOrg: PARTNER_ORGANIZATIONS[0] || '',
    referral: REFERRAL_DESTINATIONS[0] || 'Ninguna / Atención directa',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      const all = beneficiaryRepository.getAll();
      setBeneficiariesList(all);
      setFormData({
        beneficiaryId: '',
        attentionTypeId: ATTENTION_TYPES[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        quantity: ATTENTION_TYPES[0]?.defaultUnits || '1 unidad',
        responsibleOrg: PARTNER_ORGANIZATIONS[0] || '',
        referral: REFERRAL_DESTINATIONS[0] || 'Ninguna / Atención directa',
        notes: ''
      });
    }
  }, [isOpen]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'attentionTypeId') {
      const foundType = ATTENTION_TYPES.find(t => t.id === value);
      if (foundType) {
        updated.quantity = foundType.defaultUnits;
      }
    }

    setFormData(updated);
  };

  const handleSelectBeneficiary = (ben) => {
    setFormData(prev => ({
      ...prev,
      beneficiaryId: ben ? ben.id : ''
    }));
  };

  const handleClearBeneficiary = () => {
    setFormData(prev => ({ ...prev, beneficiaryId: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.beneficiaryId) {
      alert('Por favor seleccione un beneficiario.');
      return;
    }

    const selectedBen = beneficiariesList.find(b => b.id === formData.beneficiaryId);
    if (!selectedBen) {
      alert('Beneficiario no encontrado.');
      return;
    }

    const selectedType = ATTENTION_TYPES.find(t => t.id === formData.attentionTypeId);

    onSave({
      beneficiaryId: selectedBen.id,
      beneficiaryCode: selectedBen.internalCode,
      beneficiaryName: selectedBen.fullName,
      beneficiaryMunicipality: selectedBen.municipality,
      attentionTypeId: formData.attentionTypeId,
      attentionTypeLabel: selectedType?.label || 'Atención General',
      date: formData.date,
      quantity: formData.quantity,
      responsibleOrg: formData.responsibleOrg,
      referral: formData.referral,
      notes: formData.notes
    });
  };

  const attentionOptions = ATTENTION_TYPES.map(t => ({
    value: t.id,
    label: `${t.label} (${t.categoryLabel})`
  }));

  const partnerOptions = PARTNER_ORGANIZATIONS.map(org => ({
    value: org,
    label: org
  }));

  const referralOptions = REFERRAL_DESTINATIONS.map(ref => ({
    value: ref,
    label: ref
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Entrega de Ayuda o Atención Humanitaria"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={PackagePlus}
            onClick={handleSubmit}
            disabled={!formData.beneficiaryId}
          >
            Registrar Entrega de Ayuda
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Selector Autocomplete en tiempo real para 1000+ personas */}
        <BeneficiaryAutocomplete
          beneficiaries={beneficiariesList}
          selectedId={formData.beneficiaryId}
          onSelect={handleSelectBeneficiary}
          onClear={handleClearBeneficiary}
          label="Beneficiario receptor"
          required
          helperText="Escriba para buscar por nombre, código UP o cédula/PPT."
        />

        <div className="form-group">
          <Select
            label="Tipo de atención o ayuda humanitaria"
            name="attentionTypeId"
            value={formData.attentionTypeId}
            onChange={handleFieldChange}
            options={attentionOptions}
            required
          />
        </div>

        <div className="form-grid">
          <div className="col-6">
            <Input
              label="Fecha de entrega o sesión"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleFieldChange}
              required
            />
          </div>
          <div className="col-6">
            <Input
              label="Detalle / Cantidad entregada"
              name="quantity"
              value={formData.quantity}
              onChange={handleFieldChange}
              placeholder="Ej. 1 kit familiar nutricional"
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="col-6">
            <Select
              label="Entidad u organización responsable"
              name="responsibleOrg"
              value={formData.responsibleOrg}
              onChange={handleFieldChange}
              options={partnerOptions}
              required
            />
          </div>
          <div className="col-6">
            <Select
              label="Remisión o derivación externa"
              name="referral"
              value={formData.referral}
              onChange={handleFieldChange}
              options={referralOptions}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <label className="form-label">Observaciones de la entrega o resultado</label>
          <textarea
            name="notes"
            rows={3}
            className="form-control"
            placeholder="Ej. Entregado a satisfacción con firma de planilla. Madre manifiesta requerir atención pediátrica para su hijo menor..."
            value={formData.notes}
            onChange={handleFieldChange}
          />
        </div>
      </form>
    </Modal>
  );
}
