import React, { useState, useEffect } from 'react';
import { AttentionTypeBadge } from './AttentionTypeBadge';
import { TrafficLightBadge } from './TrafficLightBadge';
import { Package, CalendarClock, MapPin, Building, AlertCircle, Check } from 'lucide-react';

export function AttentionsTable({
  events = [],
  onOpenAttentionModal,
  onOpenFollowUpModal,
  onViewBeneficiary
}) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'BU').toUpperCase();
  };

  const getMunicipalityStyle = (mun = '') => {
    switch ((mun || '').toLowerCase()) {
      case 'apartadó':
      case 'apartado':
        return { backgroundColor: '#EBF3FC', color: '#1D6FBA', border: '1px solid #CFE3F9' };
      case 'turbo':
        return { backgroundColor: '#E5F6F6', color: '#0B7E7F', border: '1px solid #BCEAEA' };
      case 'necoclí':
      case 'necocli':
        return { backgroundColor: '#EAF5F2', color: '#167C55', border: '1px solid #C7EEDD' };
      default:
        return { backgroundColor: '#F0F4F3', color: '#39524E', border: '1px solid #DDE5E3' };
    }
  };

  if (events.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px dashed #D2DFDC'
        }}
      >
        <div style={{ color: '#647B77', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          No se encontraron registros de atención o seguimiento con los filtros seleccionados.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenAttentionModal}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#094D46',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            + Registrar Entrega de Ayuda
          </button>
          <button
            type="button"
            onClick={onOpenFollowUpModal}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#FFFFFF',
              color: '#094D46',
              border: '1px solid #094D46',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            + Registrar Novedad de Seguimiento
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Vista de Escritorio */}
      <div className="table-responsive desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>BENEFICIARIO</th>
              <th>CATEGORÍA</th>
              <th>DETALLE / TIPO</th>
              <th>OBSERVACIÓN / ACCIÓN</th>
              <th>PRÓXIMO CONTACTO / ESTADO</th>
              <th>MUNICIPIO</th>
              <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>FECHA</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((ev) => {
              const initials = getInitials(ev.beneficiaryName);
              const munStyle = getMunicipalityStyle(ev.beneficiaryMunicipality);
              const isAttention = ev.type === 'attention';

              return (
                <tr key={ev.id}>
                  {/* Beneficiario: Solo avatar y nombre con visualización in-place sin cambiar de módulo */}
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <div
                      onClick={() => onViewBeneficiary && onViewBeneficiary(ev.beneficiaryId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        cursor: 'pointer',
                        padding: '0.35rem 0.65rem',
                        marginLeft: '-0.65rem',
                        borderRadius: '8px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EBF4F2';
                        const text = e.currentTarget.querySelector('.beneficiary-name');
                        if (text) {
                          text.style.color = '#094D46';
                          text.style.textDecoration = 'underline';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const text = e.currentTarget.querySelector('.beneficiary-name');
                        if (text) {
                          text.style.color = '#142724';
                          text.style.textDecoration = 'none';
                        }
                      }}
                      title="Clic para ver la ficha del beneficiario"
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: '#1CA89D',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {initials}
                      </div>
                      <div
                        className="beneficiary-name"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: '#142724',
                          lineHeight: 1.25,
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {ev.beneficiaryName}
                      </div>
                    </div>
                  </td>

                  {/* Categoría: Ayuda Entregada vs Novedad de Seguimiento */}
                  <td>
                    {isAttention ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#E8F7F1',
                          color: '#178358',
                          border: '1px solid #C7EEDD'
                        }}
                      >
                        <Package size={12} /> Ayuda Entregada
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#FEF7EA',
                          color: '#966708',
                          border: '1px solid #F7E1B5'
                        }}
                      >
                        <CalendarClock size={12} /> Seguimiento
                      </span>
                    )}
                  </td>

                  {/* Tipo / Acción Específica */}
                  <td>
                    {isAttention ? (
                      <div>
                        <AttentionTypeBadge typeId={ev.attentionTypeId} label={ev.attentionTypeLabel} />
                        <div style={{ fontSize: '0.75rem', color: '#6A8480', marginTop: '3px' }}>
                          {ev.responsibleOrg}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          {ev.status === 'mejora' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                              Mejora Progresiva
                            </span>
                          )}
                          {ev.status === 'estable' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1D4ED8' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                              Estable / En curso
                            </span>
                          )}
                          {ev.status === 'alerta' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#DC2626' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                              Alerta Prioritaria
                            </span>
                          )}
                          {ev.status === 'reubicado' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C2410C' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                              Reubicación
                            </span>
                          )}
                          {ev.status === 'desercion' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#9CA3AF' }} />
                              Pérdida de Contacto
                            </span>
                          )}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#6A8480', marginTop: '2px' }}>
                          Resp: {ev.responsibleStaff}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Observación / Acción */}
                  <td style={{ maxWidth: '300px' }}>
                    {isAttention ? (
                      <div>
                        <div style={{ fontSize: '0.84rem', color: '#243A36', fontWeight: 500, lineHeight: 1.35 }}>
                          {ev.quantity}
                        </div>
                        {ev.referral && ev.referral !== 'Ninguna / Atención directa' && (
                          <div style={{ fontSize: '0.75rem', color: '#094D46', fontWeight: 600, marginTop: '3px' }}>
                            ↳ Remitido a: {ev.referral}
                          </div>
                        )}
                        {ev.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#7E9692', marginTop: '2px', fontStyle: 'italic' }}>
                            "{ev.notes}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.84rem', color: '#243A36', lineHeight: 1.35 }}>
                          {ev.observation}
                        </div>
                        {ev.pendingAction && (
                          <div style={{ fontSize: '0.76rem', color: '#094D46', fontWeight: 600, marginTop: '3px' }}>
                            <strong>Tarea pendiente:</strong> {ev.pendingAction}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Próximo Contacto / Semáforo */}
                  <td>
                    {isAttention ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          color: '#094D46',
                          backgroundColor: '#F0F5F4',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        <Check size={13} color="#094D46" /> Entregado
                      </span>
                    ) : (
                      <TrafficLightBadge nextContactDate={ev.nextContactDate} status={ev.status} />
                    )}
                  </td>

                  {/* Municipio */}
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        ...munStyle
                      }}
                    >
                      {ev.beneficiaryMunicipality}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem', color: '#5A736F', fontSize: '0.82rem', fontWeight: 600 }}>
                    {ev.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil (Tarjetas adaptadas) */}
      <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
        {paginatedEvents.map((ev) => {
          const initials = getInitials(ev.beneficiaryName);
          const munStyle = getMunicipalityStyle(ev.beneficiaryMunicipality);
          const isAttention = ev.type === 'attention';

          return (
            <div
              key={ev.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2EAE7',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isAttention ? '#E8F7F1' : '#FEF7EA',
                    color: isAttention ? '#178358' : '#966708',
                    border: `1px solid ${isAttention ? '#C7EEDD' : '#F7E1B5'}`
                  }}
                >
                  {isAttention ? 'Ayuda Entregada' : 'Seguimiento'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6A8480' }}>
                  {ev.date}
                </span>
              </div>

              <div
                onClick={() => onViewBeneficiary && onViewBeneficiary(ev.beneficiaryId)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.625rem 0', cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1CA89D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142724' }}>
                    {ev.beneficiaryName}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#094D46', fontWeight: 600 }}>
                    {isAttention ? ev.attentionTypeLabel : ev.status}
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#4B635F', margin: '0.5rem 0', lineHeight: 1.4 }}>
                {isAttention ? ev.quantity : ev.observation}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid #EAF0EE', marginTop: '0.5rem' }}>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, ...munStyle }}>
                  {ev.beneficiaryMunicipality}
                </span>
                {isAttention ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#094D46', fontWeight: 600 }}>
                    <Check size={12} color="#094D46" /> Entregado
                  </span>
                ) : (
                  <TrafficLightBadge nextContactDate={ev.nextContactDate} status={ev.status} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie de Tabla con Paginador Dinámico (10 por página) */}
      <div
        style={{
          padding: '1.1rem 1.5rem',
          borderTop: '1px solid #EAF0EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ fontSize: '0.825rem', color: '#6A8480' }}>
          Mostrando{' '}
          <strong style={{ color: '#142724' }}>
            {events.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, events.length)}
          </strong>{' '}
          de <strong style={{ color: '#094D46' }}>{events.length}</strong> registros (10 por página)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D5E1DE',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: validCurrentPage <= 1 ? '#9EAEA9' : '#142724',
              cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: pageNum === validCurrentPage ? '#094D46' : '#FFFFFF',
                color: pageNum === validCurrentPage ? '#FFFFFF' : '#142724',
                border: pageNum === validCurrentPage ? 'none' : '1px solid #D5E1DE',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D5E1DE',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: validCurrentPage >= totalPages ? '#9EAEA9' : '#142724',
              cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
