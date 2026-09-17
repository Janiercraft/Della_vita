import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input, Select } from '../../../shared/components/Input';
import { BeneficiaryAutocomplete } from '../../../shared/components/BeneficiaryAutocomplete';
import { TrafficLightBadge } from './TrafficLightBadge';
import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository';
import { FOLLOWUP_STATUSES, getFollowUpTrafficLight } from '../../../core/domain/attentionRules';
import { CalendarClock, AlertCircle } from 'lucide-react';

export function FollowUpModal({
  isOpen,
  onClose,
  onSave
}) {
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'estable',
    observation: '',
    pendingAction: '',
    nextContactDate: '',
    responsibleStaff: 'Funcionario Sede Apartadó'
  });

  useEffect(() => {
    if (isOpen) {
      const all = beneficiaryRepository.getAll();
      setBeneficiariesList(all);

      // Fecha sugerida de próximo contacto: dentro de 14 días
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 14);

      setFormData({
        beneficiaryId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'estable',
        observation: '',
        pendingAction: '',
        nextContactDate: nextDate.toISOString().split('T')[0],
        responsibleStaff: 'Funcionario Territorial Urabá'
      });
    }
  }, [isOpen]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (!formData.observation.trim()) {
      alert('Por favor ingrese una observación del seguimiento.');
      return;
    }

    const selectedBen = beneficiariesList.find(b => b.id === formData.beneficiaryId);
    if (!selectedBen) {
      alert('Beneficiario no encontrado.');
      return;
    }

    onSave({
      beneficiaryId: selectedBen.id,
      beneficiaryCode: selectedBen.internalCode,
      beneficiaryName: selectedBen.fullName,
      beneficiaryMunicipality: selectedBen.municipality,
      date: formData.date,
      status: formData.status,
      observation: formData.observation,
      pendingAction: formData.pendingAction,
      nextContactDate: formData.nextContactDate,
      responsibleStaff: formData.responsibleStaff
    });
  };

  const statusOptions = FOLLOWUP_STATUSES.map(s => ({
    value: s.value,
    label: `${s.label} - ${s.description}`
  }));

  const lightPreview = getFollowUpTrafficLight(formData.nextContactDate, formData.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Novedad y Seguimiento de Caso"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={CalendarClock}
            onClick={handleSubmit}
            disabled={!formData.beneficiaryId}
          >
            Registrar Novedad y Próximo Contacto
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Selector Autocomplete en tiempo real */}
        <BeneficiaryAutocomplete
          beneficiaries={beneficiariesList}
          selectedId={formData.beneficiaryId}
          onSelect={handleSelectBeneficiary}
          onClear={handleClearBeneficiary}
          label="Beneficiario a evaluar"
          required
          helperText="Escriba para buscar por nombre, código UP o cédula/PPT."
        />

        <div className="form-grid">
          <div className="col-6">
            <Input
              label="Fecha del seguimiento"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleFieldChange}
              required
            />
          </div>
          <div className="col-6">
            <Select
              label="Estado actual de evolución"
              name="status"
              value={formData.status}
              onChange={handleFieldChange}
              options={statusOptions}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Observación cualitativa del caso <span className="required" style={{ color: '#EF4444' }}>*</span>
          </label>
          <textarea
            name="observation"
            rows={3}
            className="form-control"
            placeholder="Describa los cambios observados en salud, protección, convivencia familiar o ingresos económicos..."
            value={formData.observation}
            onChange={handleFieldChange}
            required
          />
        </div>

        <div className="form-group">
          <Input
            label="Acción o tarea pendiente requerida"
            name="pendingAction"
            value={formData.pendingAction}
            onChange={handleFieldChange}
            placeholder="Ej. Coordinar segunda entrega nutricional / Visita domiciliaria / Verificar PPT"
          />
        </div>

        {/* Sección del Semáforo y Próximo Contacto */}
        <div
          style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #E2EAE7',
            borderRadius: '10px',
            padding: '1rem',
            marginTop: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#142724' }}>
              Programación de Próximo Contacto (Semáforo de Alerta)
            </span>
            <TrafficLightBadge nextContactDate={formData.nextContactDate} status={formData.status} />
          </div>

          <div className="form-grid" style={{ marginBottom: 0 }}>
            <div className="col-6">
              <Input
                label="Fecha de próximo contacto"
                type="date"
                name="nextContactDate"
                value={formData.nextContactDate}
                onChange={handleFieldChange}
                helperText="Define la alerta preventiva para el funcionario."
              />
            </div>
            <div className="col-6">
              <Input
                label="Profesional responsable"
                name="responsibleStaff"
                value={formData.responsibleStaff}
                onChange={handleFieldChange}
                placeholder="Nombre o cargo del funcionario"
              />
            </div>
          </div>

          {/* Advertencia en vivo si el semáforo es peligro/rojo */}
          {lightPreview.level === 'danger' && (
            <div
              style={{
                marginTop: '0.65rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #EF4444',
                borderRadius: '6px',
                color: '#991B1B',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>
                <strong>Atención:</strong> Esta novedad o fecha generará una alerta roja prioritaria en el panel de control.
              </span>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
