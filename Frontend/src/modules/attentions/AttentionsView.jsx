import React, { useState } from 'react';
import { useAttentions } from './hooks/useAttentions';
import { AttentionsTable } from './components/AttentionsTable';
import { AttentionModal } from './components/AttentionModal';
import { FollowUpModal } from './components/FollowUpModal';
import { BeneficiaryDetailModal } from '../beneficiaries/components/BeneficiaryDetailModal';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import { Toast } from '../../shared/components/Modal';
import { MUNICIPALITIES } from '../../core/constants';
import {
  Package,
  CalendarClock,
  Clock,
  AlertCircle,
  Search,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function AttentionsView() {
  const {
    filteredEvents,
    metrics,
    activeTabFilter,
    setActiveTabFilter,
    searchQuery,
    setSearchQuery,
    municipalityFilter,
    setMunicipalityFilter,
    isAttentionModalOpen,
    setIsAttentionModalOpen,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    feedbackMessage,
    setFeedbackMessage,
    recordAttention,
    recordFollowUp,
    resetAllData
  } = useAttentions();

  // Estado local para ver la Ficha del Beneficiario directamente sin salir de la pantalla
  const [selectedBeneficiaryForDetail, setSelectedBeneficiaryForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenBeneficiaryDetail = (beneficiaryId) => {
    const ben = beneficiaryRepository.getById(beneficiaryId);
    if (ben) {
      setSelectedBeneficiaryForDetail(ben);
      setIsDetailModalOpen(true);
    }
  };

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
          Atención Humanitaria y Seguimiento de Casos
        </h1>

        <p
          style={{
            color: '#5C7470',
            fontSize: '0.92rem',
            maxWidth: '920px',
            marginTop: '0.35rem',
            lineHeight: 1.5
          }}
        >
          Diferenciación estricta entre <strong>entregas puntuales de ayuda</strong> (kits nutricionales, salud, capital semilla) y <strong>novedades de seguimiento</strong> con semáforo de alerta para fechas de próximo contacto.
        </p>
      </div>

      {/* 4 Tarjetas de Métricas KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.125rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Card 1: TOTAL ATENCIONES */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #E2EAE7',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AYUDAS ENTREGADAS
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {metrics.totalAttentions}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#178358', fontWeight: 600, marginTop: '0.35rem' }}>
              Kits, salud y formación
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#E8F7F1',
              color: '#178358',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={22} />
          </div>
        </div>

        {/* Card 2: SEGUIMIENTOS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #E2EAE7',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SEGUIMIENTOS DE CASO
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {metrics.totalFollowUps}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1D6FBA', fontWeight: 600, marginTop: '0.35rem' }}>
              Novedades y evolución
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#EBF3FC',
              color: '#1D6FBA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarClock size={22} />
          </div>
        </div>

        {/* Card 3: PRÓXIMOS CONTACTOS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #E2EAE7',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PRÓXIMOS EN 7 DÍAS
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#D97706', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {metrics.upcomingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#966708', fontWeight: 600, marginTop: '0.35rem' }}>
              Semáforo preventivo activo
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FEF7EA',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
        </div>

        {/* Card 4: ALERTAS ROJAS / VENCIDOS */}
        <div
          style={{
            backgroundColor: metrics.urgentCount > 0 ? '#FEF2F2' : '#FFFFFF',
            borderRadius: '14px',
            padding: '1.25rem',
            border: metrics.urgentCount > 0 ? '2px solid #EF4444' : '1px solid #E2EAE7',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: metrics.urgentCount > 0 ? '#991B1B' : '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CASOS EN ALERTA / VENCIDOS
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: metrics.urgentCount > 0 ? '#DC2626' : '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {metrics.urgentCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: metrics.urgentCount > 0 ? '#B91C1C' : '#6A8480', fontWeight: 700, marginTop: '0.35rem' }}>
              {metrics.urgentCount > 0 ? 'Requiere acción inmediata' : 'Sin alertas vencidas'}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: metrics.urgentCount > 0 ? '#FEE2E2' : '#F0F4F3',
              color: metrics.urgentCount > 0 ? '#DC2626' : '#5A736F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Pestañas y Botones de Acción */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2EAE7',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 4px rgba(9, 77, 70, 0.03)'
        }}
      >
        {/* Fila Superior: Selector de Pestañas y Botones de Creación */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #EAF0EE'
          }}
        >
          {/* Pestañas de Vista Rápida */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTabFilter('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTabFilter === 'all' ? '#094D46' : '#F0F5F4',
                color: activeTabFilter === 'all' ? '#FFFFFF' : '#39524E',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={14} />
              Todas las Acciones ({metrics.totalEvents})
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('attentions')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTabFilter === 'attentions' ? '#094D46' : '#F0F5F4',
                color: activeTabFilter === 'attentions' ? '#FFFFFF' : '#39524E',
                transition: 'all 0.15s ease'
              }}
            >
              <Package size={14} />
              Ayudas Entregadas ({metrics.totalAttentions})
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('followups')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTabFilter === 'followups' ? '#094D46' : '#F0F5F4',
                color: activeTabFilter === 'followups' ? '#FFFFFF' : '#39524E',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarClock size={14} />
              Seguimientos ({metrics.totalFollowUps})
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('urgent')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTabFilter === 'urgent' ? 'none' : '1px solid #EF4444',
                backgroundColor: activeTabFilter === 'urgent' ? '#DC2626' : '#FEF2F2',
                color: activeTabFilter === 'urgent' ? '#FFFFFF' : '#991B1B',
                transition: 'all 0.15s ease'
              }}
            >
              <AlertCircle size={14} />
              Casos en Alerta ({metrics.urgentCount})
            </button>
          </div>

          {/* Botones de Registro Diferenciado */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsAttentionModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#094D46',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(9, 77, 70, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#073D37'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#094D46'}
            >
              <Plus size={16} />
              Entregar Ayuda
            </button>

            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#FFFFFF',
                color: '#094D46',
                border: '1.5px solid #094D46',
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6F4F2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <CalendarClock size={16} />
              Novedad de Seguimiento
            </button>
          </div>
        </div>

        {/* Fila Inferior: Buscador en tiempo real y Filtro de Municipio */}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#7E9692' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por beneficiario, código UP, tipo de ayuda o entidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                paddingLeft: '2.5rem',
                borderRadius: '8px',
                border: '1px solid #D2DFDC',
                height: '40px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ width: '190px' }}>
            <select
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
              className="form-control"
              style={{
                borderRadius: '8px',
                border: '1px solid #D2DFDC',
                height: '40px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Todos los municipios</option>
              {MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {(searchQuery || municipalityFilter || activeTabFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMunicipalityFilter('');
                setActiveTabFilter('all');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'transparent',
                color: '#6A8480',
                border: '1px solid #D2DFDC',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.825rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenedor de la Tabla de Atenciones y Seguimientos */}
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
            borderBottom: '1px solid #EAF0EE',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#142724' }}>
              Historial de Atenciones y Seguimientos
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
              {filteredEvents.length} registros
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#6A8480', fontWeight: 600 }}>
            Paginación activa • 10 registros por página
          </div>
        </div>

        <div style={{ padding: 0 }}>
          <AttentionsTable
            events={filteredEvents}
            onOpenAttentionModal={() => setIsAttentionModalOpen(true)}
            onOpenFollowUpModal={() => setIsFollowUpModalOpen(true)}
            onViewBeneficiary={handleOpenBeneficiaryDetail}
          />
        </div>
      </div>

      {/* Modal 1: Registrar Entrega de Ayuda Humanitaria */}
      <AttentionModal
        isOpen={isAttentionModalOpen}
        onClose={() => setIsAttentionModalOpen(false)}
        onSave={recordAttention}
      />

      {/* Modal 2: Registrar Novedad y Próximo Contacto (Semáforo) */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSave={recordFollowUp}
      />

      {/* Modal 3: Ficha del Beneficiario In-Place (Sin salir del Módulo 3) */}
      <BeneficiaryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBeneficiaryForDetail(null);
        }}
        beneficiary={selectedBeneficiaryForDetail}
      />

      {/* Toast Feedback */}
      <Toast
        message={feedbackMessage}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
