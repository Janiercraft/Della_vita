import React from 'react';
import { useBeneficiaries } from './hooks/useBeneficiaries';
import { BeneficiarySearch } from './components/BeneficiarySearch';
import { BeneficiaryTable } from './components/BeneficiaryTable';
import { BeneficiaryFormModal } from './components/BeneficiaryFormModal';
import { BeneficiaryDetailModal } from './components/BeneficiaryDetailModal';
import { Toast } from '../../shared/components/Modal';
import { User, Users, ShieldCheck, AlertCircle } from 'lucide-react';

export function BeneficiariesView({ directOpenBeneficiaryId, onClearDirectOpen }) {
  const {
    filteredBeneficiaries,
    beneficiaries,
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
    openCreateModal,
    openEditModal,
    openDetailModal,
    resetAllData
  } = useBeneficiaries();

  // Si se redirige desde otro módulo (ej. Módulo 2), abrir inmediatamente la ficha del usuario
  React.useEffect(() => {
    if (directOpenBeneficiaryId && beneficiaries.length > 0) {
      const target = beneficiaries.find(b => b.id === directOpenBeneficiaryId);
      if (target) {
        setSearchQuery('');
        setMunicipalityFilter('');
        setDocumentTypeFilter('');
        openDetailModal(target);
      }
      if (onClearDirectOpen) {
        onClearDirectOpen();
      }
    }
  }, [directOpenBeneficiaryId, beneficiaries, openDetailModal, onClearDirectOpen, setSearchQuery, setMunicipalityFilter, setDocumentTypeFilter]);

  // Métricas dinámicas
  const totalBeneficiaries = beneficiaries.length;
  const totalWithDocs = beneficiaries.filter(b => b.documentType !== 'SD').length;
  const totalWithoutDocs = beneficiaries.filter(b => b.documentType === 'SD').length;
  const totalFamilyMembers = beneficiaries.reduce((acc, b) => acc + (b.familyMembers?.length || 0), 0);
  const familiesWithMembersCount = beneficiaries.filter(b => (b.familyMembers?.length || 0) > 0).length;
  const validationPercentage = totalBeneficiaries > 0 ? Math.round((totalWithDocs / totalBeneficiaries) * 100) : 0;

  return (
    <div>
      {/* Encabezado del Módulo */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '1.95rem',
            fontWeight: 800,
            color: '#142724',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          Gestión de Beneficiarios y Familias
        </h1>

        <p
          style={{
            color: '#5C7470',
            fontSize: '0.92rem',
            maxWidth: '900px',
            marginTop: '0.35rem',
            lineHeight: 1.5
          }}
        >
          Registro, búsqueda y consulta unificada de personas y núcleos familiares con control preventivo de duplicados y enfoque de derechos.
        </p>
      </div>

      {/* 4 Tarjetas de Métricas idénticas al Mockup */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.125rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Card 1: TOTAL BENEFICIARIOS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.25rem 1.35rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6A8480', letterSpacing: '0.04em' }}>
              TOTAL BENEFICIARIOS
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#E8F7F4',
                color: '#094D46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {totalBeneficiaries}
            </span>
            <span
              style={{
                backgroundColor: '#E8F7F1',
                color: '#167C55',
                border: '1px solid #C7EEDD',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '20px'
              }}
            >
              +2 este mes
            </span>
          </div>
        </div>

        {/* Card 2: INTEGRANTES DE FAMILIA */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.25rem 1.35rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6A8480', letterSpacing: '0.04em' }}>
              INTEGRANTES DE FAMILIA
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#EDEBFB',
                color: '#5C4AD6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {totalFamilyMembers}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 500 }}>
              En {familiesWithMembersCount} núcleos familiares
            </span>
          </div>
        </div>

        {/* Card 3: CON DOCUMENTO */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.25rem 1.35rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6A8480', letterSpacing: '0.04em' }}>
              CON DOCUMENTO
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#E8F7F1',
                color: '#178358',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {totalWithDocs}
            </span>
            <span
              style={{
                backgroundColor: '#E8F7F1',
                color: '#167C55',
                border: '1px solid #C7EEDD',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '20px'
              }}
            >
              {validationPercentage}% validados
            </span>
          </div>
        </div>

        {/* Card 4: SIN DOC / EN TRÁMITE */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.25rem 1.35rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6A8480', letterSpacing: '0.04em' }}>
              SIN DOC / EN TRÁMITE
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FEF7EA',
                color: '#966708',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {totalWithoutDocs}
            </span>
            <span
              style={{
                backgroundColor: '#FEF7EA',
                color: '#966708',
                border: '1px solid #F7E1B5',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '20px'
              }}
            >
              Requiere alerta
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros con diseño exacto */}
      <BeneficiarySearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        municipalityFilter={municipalityFilter}
        onMunicipalityChange={setMunicipalityFilter}
        documentTypeFilter={documentTypeFilter}
        onDocumentTypeChange={setDocumentTypeFilter}
        onCreateNew={openCreateModal}
        onResetData={resetAllData}
        totalResults={filteredBeneficiaries.length}
      />

      {/* Listado de Beneficiarios con diseño exacto */}
      <BeneficiaryTable
        beneficiaries={filteredBeneficiaries}
        onView={openDetailModal}
        onEdit={openEditModal}
        onCreateNew={openCreateModal}
      />

      {/* Modal de Alta y Edición */}
      {isFormOpen && (
        <BeneficiaryFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={saveBeneficiary}
          editingBeneficiary={editingBeneficiary}
          onVerifyDuplicate={verifyDuplicate}
        />
      )}

      {/* Modal de Ficha y Consulta Detallada */}
      {isDetailOpen && (
        <BeneficiaryDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          beneficiary={selectedBeneficiary}
          onEdit={openEditModal}
        />
      )}

      {/* Mensajes Toast */}
      <Toast
        message={feedbackMessage}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
