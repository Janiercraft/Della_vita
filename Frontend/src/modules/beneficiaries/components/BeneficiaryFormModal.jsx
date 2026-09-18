import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { Modal, Alert } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input, Select } from '../../../shared/components/Input';
import {
  MUNICIPALITIES,
  DOCUMENT_TYPES,
  POPULATION_GROUPS,
  ETHNICITIES,
  GENDERS,
  KINSHIP_TYPES
} from '../../../core/constants';
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, Trash2, Users, ShieldCheck } from 'lucide-react';

export function BeneficiaryFormModal({
  isOpen,
  onClose,
  onSave,
  editingBeneficiary = null,
  onVerifyDuplicate
}) {
  const { canApproveConflicts } = useAuth();
  const initialFormState = {
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    documentType: 'CC',
    documentNumber: '',
    birthDate: '',
    phone: '',
    municipality: 'Apartadó',
    address: '',
    populationGroup: 'Comunidad Local',
    ethnicity: 'Ninguna / No aplica',
    isHeadOfHousehold: false,
    hasDisability: false,
    disabilityDetails: '',
    dataProcessingConsent: false,
    notes: '',
    familyMembers: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [duplicateStatus, setDuplicateStatus] = useState({ isDuplicate: false, message: '', isStrict: false });
  const [supervisorAuthorized, setSupervisorAuthorized] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '', kinship: 'Hijo(a)', age: '', documentType: 'SD', documentNumber: '',
    hasDisability: false, disabilityDetails: ''
  });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editingBeneficiary) {
      setFormData({
        ...initialFormState,
        ...editingBeneficiary
      });
      setDuplicateStatus({ isDuplicate: false, message: '', isStrict: false });
    } else {
      setFormData(initialFormState);
      setDuplicateStatus({ isDuplicate: false, message: '', isStrict: false });
    }
    setSupervisorAuthorized(false);
    setShowMemberForm(false);
    setFormErrors({});
  }, [editingBeneficiary, isOpen]);

  // Verificación reactiva preventiva de duplicados mientras escribe
  const handleDocumentChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSupervisorAuthorized(false);

    if (onVerifyDuplicate) {
      const check = onVerifyDuplicate(updated, editingBeneficiary ? editingBeneficiary.id : null);
      setDuplicateStatus(check);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (name === 'documentNumber' || name === 'documentType' || name === 'firstName' || name === 'firstLastName' || name === 'birthDate' || name === 'phone') {
      handleDocumentChange(name, val);
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddFamilyMember = () => {
    if (!newMember.fullName.trim()) {
      alert('Por favor ingrese el nombre del familiar.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          id: `fam-temp-${Date.now()}`,
          fullName: newMember.fullName.trim(),
          kinship: newMember.kinship,
          age: Number(newMember.age) || 0,
          documentType: newMember.documentType,
          documentNumber: newMember.documentType === 'SD' ? '' : newMember.documentNumber.trim(),
          hasDisability: newMember.hasDisability,
          disabilityDetails: newMember.hasDisability ? newMember.disabilityDetails.trim() : '',
          disability: newMember.hasDisability ? newMember.disabilityDetails.trim() : ''
        }
      ]
    }));
    setNewMember({
      fullName: '', kinship: 'Hijo(a)', age: '', documentType: 'SD', documentNumber: '',
      hasDisability: false, disabilityDetails: ''
    });
    setShowMemberForm(false);
  };

  const handleRemoveFamilyMember = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones mínimas
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'El primer nombre es requerido.';
    if (!formData.firstLastName.trim()) errors.firstLastName = 'El primer apellido es requerido.';
    if (formData.documentType !== 'SD' && !formData.documentNumber.trim()) {
      errors.documentNumber = 'El número de documento es obligatorio para este tipo.';
    }
    if (!formData.municipality) errors.municipality = 'Seleccione el municipio.';
    if (!formData.dataProcessingConsent) {
      errors.dataProcessingConsent = 'Debe registrar la autorización para tratamiento de datos.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (duplicateStatus.isDuplicate && duplicateStatus.isStrict) {
      alert('No es posible guardar: Existe un duplicado estricto por documento.');
      return;
    }

    if (duplicateStatus.isDuplicate && !duplicateStatus.isStrict && !supervisorAuthorized) {
      alert('Existe una advertencia de posible coincidencia. La decisión final debe ser autorizada marcando la casilla correspondiente.');
      return;
    }

    onSave(formData);
  };

  const isWithoutDoc = formData.documentType === 'SD';
  const isStrictBlocked = duplicateStatus.isDuplicate && duplicateStatus.isStrict;
  // Profesional no puede autorizar: queda bloqueado si hay coincidencia no estricta
  const isPendingSupervisor = duplicateStatus.isDuplicate && !duplicateStatus.isStrict &&
    (canApproveConflicts ? !supervisorAuthorized : true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBeneficiary ? `Editar Beneficiario: ${formData.internalCode || ''}` : 'Nuevo Registro de Beneficiario'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isStrictBlocked || isPendingSupervisor}
          >
            {editingBeneficiary ? 'Guardar Cambios' : 'Registrar Beneficiario'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Alerta de duplicado estricto (ROJO BLOQUEANTE) */}
        {duplicateStatus.isDuplicate && duplicateStatus.isStrict && (
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
                Regla anti-duplicados activada (Bloqueo estricto por documento):
              </strong>
              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#991B1B', lineHeight: 1.4 }}>
                {duplicateStatus.message}
              </p>
              <small style={{ display: 'block', marginTop: '0.35rem', fontWeight: 700, color: '#B91C1C' }}>
                El sistema no permite guardar registros duplicados con el mismo tipo y número de documento de identidad.
              </small>
            </div>
          </div>
        )}

        {/* Alerta de posible coincidencia preventiva cuando no hay documento o hay datos similares (ÁMBAR CON AUTORIZACIÓN) */}
        {duplicateStatus.isDuplicate && !duplicateStatus.isStrict && (
          <div
            style={{
              padding: '1rem 1.15rem',
              backgroundColor: '#FEF9C3',
              border: '2px solid #EAB308',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              color: '#854D0E',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <AlertTriangle size={22} color="#CA8A04" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.92rem', color: '#713F12', display: 'block' }}>
                Advertencia Preventiva de Coincidencia (Persona sin documento o datos similares):
              </strong>
              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#854D0E', lineHeight: 1.4 }}>
                {duplicateStatus.message}
              </p>

              {canApproveConflicts ? (
                /* Coordinadora: puede autorizar y continuar */
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#FEF08A',
                    borderRadius: '6px',
                    border: '1px solid #FACC15'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: '#713F12' }}>
                    <input
                      type="checkbox"
                      checked={supervisorAuthorized}
                      onChange={(e) => setSupervisorAuthorized(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: '#094D46', cursor: 'pointer' }}
                    />
                    <span>
                      Decisión de Coordinadora: He evaluado esta advertencia y autorizo continuar con el registro.
                    </span>
                  </label>
                </div>
              ) : (
                /* Profesional CLA: solo puede ver la advertencia, no puede autorizar */
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#FFF7ED',
                    borderRadius: '6px',
                    border: '1px solid #F97316',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#7C2D12'
                  }}
                >
                  <ShieldCheck size={16} color="#EA580C" style={{ flexShrink: 0 }} />
                  <span>
                    Esta coincidencia requiere autorización de la <strong>Coordinadora</strong>. Escala este caso antes de guardar.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', fontWeight: 700 }}>
            1. Información Básica y Documento de Identidad
          </h4>
          <div className="form-grid">
            <div className="col-3">
              <Input
                label="Primer Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleFieldChange}
                placeholder="Ej. María"
                required
                error={formErrors.firstName}
              />
            </div>
            <div className="col-3">
              <Input
                label="Segundo Nombre"
                name="secondName"
                value={formData.secondName}
                onChange={handleFieldChange}
                placeholder="Ej. Elena"
              />
            </div>
            <div className="col-3">
              <Input
                label="Primer Apellido"
                name="firstLastName"
                value={formData.firstLastName}
                onChange={handleFieldChange}
                placeholder="Ej. Rivas"
                required
                error={formErrors.firstLastName}
              />
            </div>
            <div className="col-3">
              <Input
                label="Segundo Apellido"
                name="secondLastName"
                value={formData.secondLastName}
                onChange={handleFieldChange}
                placeholder="Ej. Palacios"
              />
            </div>
            <div className="col-4">
              <Select
                label="Tipo de documento"
                name="documentType"
                value={formData.documentType}
                onChange={handleFieldChange}
                options={DOCUMENT_TYPES}
                required
              />
            </div>
            <div className="col-4">
              <Input
                label={isWithoutDoc ? 'Número de documento (Opcional)' : 'Número de documento'}
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleFieldChange}
                placeholder={isWithoutDoc ? 'En trámite / Sin documento' : 'Ej. 1038123456'}
                required={!isWithoutDoc}
                disabled={isWithoutDoc}
                error={formErrors.documentNumber || (duplicateStatus.isDuplicate && duplicateStatus.isStrict ? 'Documento ya registrado en el sistema' : '')}
                helperText={isWithoutDoc ? 'Persona en condición especial indocumentada o en trámite de regularización.' : ''}
              />
            </div>
            <div className="col-4">
              <Input
                label="Fecha de nacimiento"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleFieldChange}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', fontWeight: 700 }}>
            2. Ubicación Territorial y Contacto (Urabá)
          </h4>
          <div className="form-grid">
            <div className="col-6">
              <Select
                label="Municipio"
                name="municipality"
                value={formData.municipality}
                onChange={handleFieldChange}
                options={MUNICIPALITIES}
                required
                error={formErrors.municipality}
              />
            </div>
            <div className="col-6">
              <Input
                label="Teléfono / WhatsApp de contacto"
                name="phone"
                value={formData.phone}
                onChange={handleFieldChange}
                placeholder="Ej. 311 555 0123"
              />
            </div>
            <div className="col-12">
              <Input
                label="Dirección o punto de referencia"
                name="address"
                value={formData.address}
                onChange={handleFieldChange}
                placeholder="Ej. Diagonal a la escuela comunitaria"
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', fontWeight: 700 }}>
            3. Enfoque Diferencial y Caracterización Sociodemográfica
          </h4>
          <div className="form-grid">
            <div className="col-6">
              <Select
                label="Grupo poblacional"
                name="populationGroup"
                value={formData.populationGroup}
                onChange={handleFieldChange}
                options={POPULATION_GROUPS}
              />
            </div>
            <div className="col-6">
              <Select
                label="Pertenencia étnica"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleFieldChange}
                options={ETHNICITIES}
              />
            </div>
            <div className="col-6" style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isHeadOfHousehold"
                  checked={formData.isHeadOfHousehold}
                  onChange={handleFieldChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                ¿Es jefatura de hogar / cabeza de familia?
              </label>
            </div>
            <div className="col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasDisability"
                  checked={formData.hasDisability}
                  onChange={handleFieldChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                ¿Presenta alguna condición de discapacidad?
              </label>
              {formData.hasDisability && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Input
                    name="disabilityDetails"
                    value={formData.disabilityDetails}
                    onChange={handleFieldChange}
                    placeholder="Especifique (ej. visual, auditiva, motriz)"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Núcleo Familiar */}
        <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> 4. Núcleo Familiar ({formData.familyMembers.length} integrantes)
            </h4>
            {!showMemberForm && (
              <Button size="sm" variant="outline" icon={Plus} onClick={() => setShowMemberForm(true)}>
                Añadir Integrante
              </Button>
            )}
          </div>

          {/* Formulario para nuevo integrante */}
          {showMemberForm && (
            <div style={{ backgroundColor: 'var(--bg-surface-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Registrar familiar:</h5>
              <div className="form-grid">
                <div className="col-6">
                  <Input
                    label="Nombre completo del familiar"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ej. Lucas David Rivas"
                  />
                </div>
                <div className="col-3">
                  <Select
                    label="Parentesco"
                    value={newMember.kinship}
                    onChange={(e) => setNewMember(prev => ({ ...prev, kinship: e.target.value }))}
                    options={KINSHIP_TYPES}
                  />
                </div>
                <div className="col-3">
                  <Input
                    label="Edad (Años)"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Ej. 8"
                  />
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="col-3">
                  <Select
                    label="Tipo de documento"
                    value={newMember.documentType}
                    onChange={(e) => setNewMember(prev => ({
                      ...prev,
                      documentType: e.target.value,
                      documentNumber: e.target.value === 'SD' ? '' : prev.documentNumber
                    }))}
                    options={DOCUMENT_TYPES}
                  />
                </div>
                <div className="col-3">
                  <Input
                    label="Número de documento"
                    value={newMember.documentNumber}
                    onChange={(e) => setNewMember(prev => ({ ...prev, documentNumber: e.target.value }))}
                    disabled={newMember.documentType === 'SD'}
                    placeholder={newMember.documentType === 'SD' ? 'Sin documento' : 'Documento'}
                  />
                </div>
                <div className="col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    <input
                      type="checkbox"
                      checked={newMember.hasDisability}
                      onChange={(e) => setNewMember(prev => ({ ...prev, hasDisability: e.target.checked, disabilityDetails: e.target.checked ? prev.disabilityDetails : '' }))}
                      style={{ width: '17px', height: '17px', accentColor: 'var(--color-primary)' }}
                    />
                    ¿El familiar presenta discapacidad?
                  </label>
                  {newMember.hasDisability && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <Input
                        value={newMember.disabilityDetails}
                        onChange={(e) => setNewMember(prev => ({ ...prev, disabilityDetails: e.target.value }))}
                        placeholder="Detalle de discapacidad"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Button size="sm" variant="secondary" onClick={() => setShowMemberForm(false)}>
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" onClick={handleAddFamilyMember}>
                  Guardar Integrante
                </Button>
              </div>
            </div>
          )}

          {/* Lista de integrantes agregados */}
          {formData.familyMembers.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
              Aún no se han registrado integrantes familiares para este beneficiario.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.familyMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{member.fullName}</span>
                    <span className="badge badge-primary">{member.kinship}</span>
                    {member.age > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.age} años</span>
                    )}
                    {member.hasDisability && (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Discapacidad{member.disabilityDetails || member.disability ? `: ${member.disabilityDetails || member.disability}` : ''}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFamilyMember(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--status-danger-text)', cursor: 'pointer', padding: '4px' }}
                    title="Remover integrante"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', fontWeight: 700 }}>
            5. Observaciones adicionales
          </h4>
          <textarea
            name="notes"
            rows={3}
            className="form-control"
            value={formData.notes || ''}
            onChange={handleFieldChange}
            placeholder="Información relevante para la atención, caracterización o seguimiento del beneficiario..."
          />
        </div>

        {/* Protección de Datos / Habeas Data Obligatorio */}
        <div
          style={{
            backgroundColor: formErrors.dataProcessingConsent ? '#FEF2F2' : '#E6F4F2',
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            border: formErrors.dataProcessingConsent ? '2px solid #EF4444' : '1px solid #B7DFD9',
            marginTop: '1rem',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <ShieldCheck
              size={20}
              color={formErrors.dataProcessingConsent ? '#DC2626' : '#094D46'}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: formErrors.dataProcessingConsent ? '#991B1B' : '#094D46'
                }}
              >
                <input
                  type="checkbox"
                  name="dataProcessingConsent"
                  checked={formData.dataProcessingConsent}
                  onChange={handleFieldChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: formErrors.dataProcessingConsent ? '#DC2626' : '#094D46',
                    marginTop: '2px'
                  }}
                />
                <span>
                  Registro de Autorización de Tratamiento de Datos Personales (Habeas Data) *
                </span>
              </label>
              <p style={{ fontSize: '0.775rem', color: formErrors.dataProcessingConsent ? '#7F1D1D' : '#5C7470', marginTop: '0.25rem', paddingLeft: '1.625rem' }}>
                El beneficiario ha sido informado y autoriza el registro de su información para la gestión humanitaria en el marco del Proyecto URABÁ-PAÍS (Ley 1581 de 2012).
              </p>

              {formErrors.dataProcessingConsent && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#DC2626',
                    fontSize: '0.825rem',
                    marginTop: '0.45rem',
                    paddingLeft: '1.625rem',
                    fontWeight: 700
                  }}
                >
                  <AlertCircle size={15} color="#DC2626" />
                  <span>{formErrors.dataProcessingConsent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
