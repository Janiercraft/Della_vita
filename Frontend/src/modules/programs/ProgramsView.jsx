import React, { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePrograms } from './hooks/usePrograms';
import { ProgramCatalogCards } from './components/ProgramCatalogCards';
import { ProgramsTable } from './components/ProgramsTable';
import { ProgramEnrollModal } from './components/ProgramEnrollModal';
import { ProgramStatusModal } from './components/ProgramStatusModal';
import { BeneficiaryDetailModal } from '../beneficiaries/components/BeneficiaryDetailModal';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import { Toast } from '../../shared/components/Modal';
import { MUNICIPALITIES } from '../../core/constants';
import { ENROLLMENT_STATUSES } from '../../core/domain/programRules';
import { Search, Plus, RotateCcw, FolderGit2, PlayCircle, CheckCircle2, Clock, X, CalendarPlus } from 'lucide-react';

export function ProgramsView({ onNavigateToBeneficiary }) {
  const { role } = useAuth();
  const canManageEvents = role === 'admin' || role === 'coordinador';
  const {
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
    resetProgramsData,
    openStatusModal
  } = usePrograms();

  // Estado local para ver la Ficha del Beneficiario directamente en el Módulo 2 (sin cambiar de pestaña)
  const [selectedBeneficiaryForDetail, setSelectedBeneficiaryForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenBeneficiaryDetail = async (beneficiaryId) => {
    try {
      const ben = await beneficiaryRepository.getById(beneficiaryId);
      if (ben) {
        setSelectedBeneficiaryForDetail(ben);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Métricas dinámicas del Módulo 2
  const totalEnrollments = enrollments.length;
  const inProgressCount = enrollments.filter(e => e.status === 'en_proceso').length;
  const finalizedCount = enrollments.filter(e => e.status === 'finalizado').length;
  const pendingCount = enrollments.filter(e => e.status === 'inscrito').length;
  const now = new Date();
  const enrollmentsThisMonth = enrollments.filter((e) => {
    if (!e.createdAt) return false;
    const d = new Date(e.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div>
      {/* Encabezado del Módulo */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
        <h1
          style={{
            fontSize: '1.95rem',
            fontWeight: 800,
            color: '#142724',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          Programas y Participación Comunitaria
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
          Vinculación de beneficiarios y familias a proyectos en las tres líneas de intervención humanitaria, salud e integración socioeconómica con seguimiento de estados.
        </p>
          </div>

          {canManageEvents && (
            <button
              type="button"
              onClick={() => { window.location.hash = '#/eventos'; }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.55rem',
                background: '#0D7C70', color: '#FFFFFF', border: 'none',
                borderRadius: '11px', padding: '.78rem 1rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 5px 16px rgba(13,124,112,.18)'
              }}
            >
              <CalendarPlus size={18} /> Crear evento
            </button>
          )}
        </div>
      </div>

      {/* 4 Tarjetas de Métricas KPI idénticas a las del Módulo 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.125rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Card 1: TOTAL VINCULACIONES */}
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
              TOTAL VINCULACIONES
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
              <FolderGit2 size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {totalEnrollments}
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
              +{enrollmentsThisMonth} este mes
            </span>
          </div>
        </div>

        {/* Card 2: EN PROCESO */}
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
              EN PROCESO (ACTIVAS)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#EBF3FC',
                color: '#1D6FBA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PlayCircle size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {inProgressCount}
            </span>
            <span
              style={{
                backgroundColor: '#EBF3FC',
                color: '#1D6FBA',
                border: '1px solid #CFE3F9',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '20px'
              }}
            >
              En ejecución activa
            </span>
          </div>
        </div>

        {/* Card 3: FINALIZADOS */}
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
              RUTAS FINALIZADAS
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
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {finalizedCount}
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
              100% culminados
            </span>
          </div>
        </div>

        {/* Card 4: INSCRITOS PENDIENTES */}
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
              INSCRITOS (POR INICIAR)
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
              <Clock size={17} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1 }}>
              {pendingCount}
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
              Pendiente inicio
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de las 3 Líneas de Intervención */}
      <ProgramCatalogCards
        enrollments={enrollments}
        programs={programsCatalog}
        activeLineFilter={lineFilter}
        onSelectLine={setLineFilter}
      />

      {/* Barra de Filtros y Búsqueda */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          backgroundColor: '#FFFFFF',
          padding: '0.875rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid #E2EAE7',
          boxShadow: '0 1px 4px rgba(9, 77, 70, 0.03)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
          {/* Buscador de personas o programas */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8CA29E'
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por beneficiario, código UP o programa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.5rem',
                borderRadius: '8px',
                border: '1px solid #D2DFDC',
                fontSize: '0.875rem',
                height: '42px'
              }}
            />
          </div>

          {/* Filtro por estado de participación */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #D2DFDC',
                fontSize: '0.875rem',
                height: '42px',
                backgroundColor: '#FFFFFF',
                color: '#142724'
              }}
            >
              <option value="">Todos los estados</option>
              {ENROLLMENT_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por municipio */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #D2DFDC',
                fontSize: '0.875rem',
                height: '42px',
                backgroundColor: '#FFFFFF',
                color: '#142724'
              }}
            >
              <option value="">Todos los municipios</option>
              {MUNICIPALITIES.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={resetProgramsData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0 1rem',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CFDCD8',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#314B47',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            title="Recargar participaciones desde la API"
          >
            <RotateCcw size={15} color="#55706C" />
            Recargar datos
          </button>

          <button
            type="button"
            onClick={() => setIsEnrollModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0 1.25rem',
              height: '42px',
              backgroundColor: '#094D46',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(9, 77, 70, 0.18)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#073F39'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#094D46'}
          >
            <Plus size={17} strokeWidth={2.5} />
            Vincular a Programa
          </button>
        </div>
      </div>

      {/* Listado de Participaciones Activas */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2EAE7',
          boxShadow: '0 1px 4px rgba(9, 77, 70, 0.03)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EAF0EE'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#142724' }}>
              Participaciones Registradas
            </h3>
            <span
              style={{
                backgroundColor: '#E4F5F1',
                color: '#0E6D63',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px'
              }}
            >
              {filteredEnrollments.length} vinculaciones
            </span>
            {lineFilter && (
              <span
                className="badge badge-info"
                style={{ cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setLineFilter('')}
              >
                Filtro de línea activo <X size={12} />
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#6A8480', fontWeight: 600 }}>
            {filteredEnrollments.length} vinculaciones registradas • 10 por página
          </div>
        </div>

        <div style={{ padding: 0 }}>
          <ProgramsTable
            enrollments={filteredEnrollments}
            onOpenStatusModal={openStatusModal}
            onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
            onNavigateToBeneficiary={handleOpenBeneficiaryDetail}
          />
        </div>
      </div>

      {/* Modal de Ficha del Beneficiario directa sin abandonar el Módulo 2 */}
      <BeneficiaryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBeneficiaryForDetail(null);
        }}
        beneficiary={selectedBeneficiaryForDetail}
      />

      {/* Modal para Vincular a un Programa */}
      <ProgramEnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnroll={enrollBeneficiary}
        existingEnrollments={enrollments}
        programsCatalog={programsCatalog}
      />

      {/* Modal para Cambiar Estado de Participación */}
      <ProgramStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        enrollment={selectedEnrollment}
        onUpdateStatus={changeEnrollmentStatus}
      />

      {/* Toast Feedback */}
      <Toast
        message={feedbackMessage}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
