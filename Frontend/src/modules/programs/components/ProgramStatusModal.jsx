import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Input';
import { ENROLLMENT_STATUSES } from '../../../core/domain/programRules';
import { ProgramStatusBadge } from './ProgramStatusBadge';
import { RefreshCw } from 'lucide-react';

export function ProgramStatusModal({
  isOpen,
  onClose,
  enrollment,
  onUpdateStatus
}) {
  const [newStatus, setNewStatus] = useState('en_proceso');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (enrollment) {
      setNewStatus(enrollment.status || 'en_proceso');
      setNotes('');
    }
  }, [enrollment, isOpen]);

  if (!enrollment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(enrollment.id, newStatus, notes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar Estado de Participación"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" icon={RefreshCw} onClick={handleSubmit}>
            Guardar Nuevo Estado
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'var(--bg-surface-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Beneficiario:</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
            {enrollment.beneficiaryName} ({enrollment.beneficiaryCode})
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Programa: <strong>{enrollment.programName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado Actual:</span>
            <ProgramStatusBadge status={enrollment.status} />
          </div>
        </div>

        <div className="form-group">
          <Select
            label="Nuevo Estado de Participación"
            name="newStatus"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={ENROLLMENT_STATUSES}
            required
            helperText="Cambie el estado según el avance del beneficiario en la ruta humanitaria."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Novedad o Razón del Cambio</label>
          <textarea
            className="form-control"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Culminó satisfactoriamente las sesiones de formación / Inició fase productiva..."
          />
        </div>
      </form>
    </Modal>
  );
}
