import React, { useState, useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import { programRepository } from '../programs/services/programRepository';
import { attentionRepository } from '../attentions/services/attentionRepository';
import { PROGRAMS_CATALOG } from '../../core/domain/programRules';
import { INTERVENTION_LINES } from '../../core/constants';
import { ProgramStatusBadge } from '../programs/components/ProgramStatusBadge';
import { TrafficLightBadge } from '../attentions/components/TrafficLightBadge';
import { AttentionTypeBadge } from '../attentions/components/AttentionTypeBadge';
import { Toast } from '../../shared/components/Modal';
import {
  Sparkles,
  FolderGit2,
  Package,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Users,
  User,
  ArrowRight,
  BookOpen,
  HeartHandshake
} from 'lucide-react';

export function BeneficiaryPortalView() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-programs' | 'my-attentions'
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [selectedLineFilter, setSelectedLineFilter] = useState('all');

  // Obtener datos en vivo del beneficiario logueado
  const beneficiary = useMemo(() => {
    return beneficiaryRepository.getById(currentUser.beneficiaryId) || {
      id: currentUser.beneficiaryId || 'ben-001',
      fullName: currentUser.name,
      internalCode: currentUser.internalCode || 'UP-2026-0001',
      municipality: currentUser.territory || 'Apartadó',
      documentType: 'CC',
      documentNumber: '1038123456',
      familyMembers: []
    };
  }, [currentUser]);

  // Obtener vinculaciones en tiempo real
  const myEnrollments = useMemo(() => {
    return programRepository.getByBeneficiaryId(beneficiary.id) || [];
  }, [beneficiary.id, feedbackMessage]);

  // Obtener atenciones y seguimientos en tiempo real
  const myAttentions = useMemo(() => {
    return (attentionRepository.getAttentions() || []).filter(a => a.beneficiaryId === beneficiary.id);
  }, [beneficiary.id]);

  const myFollowups = useMemo(() => {
    return (attentionRepository.getFollowUps() || []).filter(f => f.beneficiaryId === beneficiary.id);
  }, [beneficiary.id]);

  const enrolledProgramIds = useMemo(() => {
    return new Set(myEnrollments.map(e => e.programId));
  }, [myEnrollments]);

  // Catálogo de programas filtrado por línea
  const filteredCatalog = useMemo(() => {
    if (selectedLineFilter === 'all') return PROGRAMS_CATALOG;
    return PROGRAMS_CATALOG.filter(p => p.lineId === selectedLineFilter);
  }, [selectedLineFilter]);

  // Acción: Postularme a un programa
  const handleApplyToProgram = (program) => {
    try {
      programRepository.createEnrollment({
        beneficiaryId: beneficiary.id,
        programId: program.id,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'inscrito',
        notes: 'Postulación realizada directamente por el beneficiario desde el Portal Ciudadano.'
      });

      setFeedbackMessage({
        type: 'success',
        text: `¡Excelente! Te has postulado exitosamente al programa "${program.name}". El equipo técnico de ${beneficiary.municipality} revisará tu solicitud.`
      });
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'No fue posible registrar la postulación.'
      });
    }
  };

  const familyMembers = beneficiary.familyMembers || [];
  const children = familyMembers.filter(m => (m.kinship || m.relationship || '').toLowerCase().includes('hijo'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tarjeta de Bienvenida y Perfil Ciudadano */}
      <div
        style={{
          backgroundColor: '#063630',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(6, 54, 48, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                backgroundColor: '#1CA89D',
                color: '#FFFFFF',
                fontSize: '1.35rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(28, 168, 157, 0.4)'
              }}
            >
              {beneficiary.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(28, 168, 157, 0.25)',
                    color: '#3CE3BE',
                    border: '1px solid rgba(60, 227, 190, 0.35)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px'
                  }}
                >
                  EXPEDIENTE: {beneficiary.internalCode}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#E0EBE9',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ShieldCheck size={13} color="#3CE3BE" /> Habeas Data Autorizado
                </span>
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.4rem 0 0.2rem 0', letterSpacing: '-0.01em' }}>
                Bienvenido(a), {beneficiary.fullName}
              </h1>

              <div style={{ fontSize: '0.86rem', color: '#97BFB8', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> Municipio: <strong>{beneficiary.municipality}</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} /> Familiares registrados: <strong>{familyMembers.length}</strong>
                </span>
                {children.length > 0 && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} /> Hijos a cargo: <strong>{children.length}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                backgroundColor: '#0D5C54',
                color: '#42D8B8',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-block'
              }}
            >
              Portal de Autogestión Ciudadana
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas del Portal del Beneficiario */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2EAE7',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          boxShadow: '0 2px 6px rgba(9, 77, 70, 0.04)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: activeTab === 'catalog' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'catalog' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'catalog' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={16} />
          <span>1. Catálogo de Programas y Oportunidades</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-programs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: activeTab === 'my-programs' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'my-programs' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'my-programs' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FolderGit2 size={16} />
          <span>2. Mis Programas y Solicitudes ({myEnrollments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-attentions')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: activeTab === 'my-attentions' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'my-attentions' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'my-attentions' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Package size={16} />
          <span>3. Mis Ayudas Recibidas y Citas ({myAttentions.length + myFollowups.length})</span>
        </button>
      </div>

      {/* CONTENIDO 1: CATÁLOGO DE PROGRAMAS Y AUTO-POSTULACIÓN */}
      {activeTab === 'catalog' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142724', margin: '0 0 0.25rem 0' }}>
                Programas Disponibles en {beneficiary.municipality}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#5C7470', margin: 0 }}>
                Explora los programas del Consorcio (COOPI, FADV, HIAS, HI) y postúlate a las líneas de tu interés.
              </p>
            </div>

            {/* Filtro por Línea */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedLineFilter('all')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #CADBD6',
                  backgroundColor: selectedLineFilter === 'all' ? '#094D46' : '#FFFFFF',
                  color: selectedLineFilter === 'all' ? '#FFFFFF' : '#39524E',
                  cursor: 'pointer'
                }}
              >
                Todas las Líneas
              </button>
              {INTERVENTION_LINES.map(line => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setSelectedLineFilter(line.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid #CADBD6',
                    backgroundColor: selectedLineFilter === line.id ? '#094D46' : '#FFFFFF',
                    color: selectedLineFilter === line.id ? '#FFFFFF' : '#39524E',
                    cursor: 'pointer'
                  }}
                >
                  {line.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Programas Disponibles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.1rem' }}>
            {filteredCatalog.map(prog => {
              const isEnrolled = enrolledProgramIds.has(prog.id);

              return (
                <div
                  key={prog.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: isEnrolled ? '1.5px solid #22C55E' : '1.5px solid #E2EAE7',
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 2px 8px rgba(9, 77, 70, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#EFF9F6',
                          color: '#094D46',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px'
                        }}
                      >
                        {prog.lineName}
                      </span>
                      {isEnrolled && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#E8F7F1',
                            color: '#167C55',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <CheckCircle2 size={12} /> Inscrito
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', margin: '0 0 0.4rem 0' }}>
                      {prog.name}
                    </h3>

                    <p style={{ fontSize: '0.82rem', color: '#5C7470', lineHeight: 1.5, margin: 0 }}>
                      {prog.description}
                    </p>

                    <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#6A8480', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Territorio prioritario:</span>
                      <strong>Apartadó • Turbo • Necoclí</strong>
                    </div>
                  </div>

                  {/* Botón de Postulación o Estado */}
                  <div>
                    {isEnrolled ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#DCFCE7',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          padding: '0.6rem',
                          textAlign: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#15803D'
                        }}
                      >
                        <CheckCircle2 size={15} /> Ya estás postulado / participando
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyToProgram(prog)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          padding: '0.65rem 1rem',
                          backgroundColor: '#094D46',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '9px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 2px 6px rgba(9, 77, 70, 0.2)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#073F39'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#094D46'}
                      >
                        <span>Solicitar Vinculación / Postularme</span>
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO 2: MIS PROGRAMAS Y SOLICITUDES */}
      {activeTab === 'my-programs' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(9, 77, 70, 0.04)'
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142724', margin: '0 0 0.25rem 0' }}>
              Mis Programas y Solicitudes ({myEnrollments.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#5C7470', margin: 0 }}>
              Aquí puedes ver el estado de los programas a los que te has vinculado o postulado.
            </p>
          </div>

          {myEnrollments.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6A8480', backgroundColor: '#F8FAF9', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 1rem 0' }}>Aún no tienes solicitudes de vinculación activas.</p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                style={{
                  backgroundColor: '#094D46',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Explorar Catálogo de Programas
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>PROGRAMA</th>
                    <th>LÍNEA DE ACCIÓN</th>
                    <th>FECHA DE SOLICITUD</th>
                    <th>ESTADO ACTUAL</th>
                  </tr>
                </thead>
                <tbody>
                  {myEnrollments.map(enr => (
                    <tr key={enr.id}>
                      <td style={{ fontWeight: 700, color: '#142724' }}>{enr.programName}</td>
                      <td>
                        <span style={{ backgroundColor: '#EFF9F6', color: '#094D46', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                          {enr.lineName}
                        </span>
                      </td>
                      <td style={{ color: '#4B635F' }}>{enr.enrollmentDate}</td>
                      <td>
                        <ProgramStatusBadge status={enr.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 3: MIS AYUDAS Y CITAS */}
      {activeTab === 'my-attentions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Bloque 1: Ayudas Humanitarias Entregadas */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2EAE7',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(9, 77, 70, 0.04)'
            }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="#094D46" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142724', margin: 0 }}>
                Ayudas Humanitarias Entregadas ({myAttentions.length})
              </h3>
            </div>

            {myAttentions.length === 0 ? (
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAF9', borderRadius: '8px', color: '#6A8480', fontSize: '0.85rem' }}>
                Aún no registras entregas directas de ayudas humanitarias registradas en sistema.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>FECHA</th>
                      <th>TIPO DE AYUDA</th>
                      <th>DETALLE ENTREGADO</th>
                      <th>RESPONSABLE</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttentions.map(att => (
                      <tr key={att.id}>
                        <td style={{ fontWeight: 600, color: '#5A736F' }}>{att.date}</td>
                        <td>
                          <AttentionTypeBadge typeId={att.attentionTypeId} />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#142724' }}>{att.attentionTypeName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#4B635F' }}>Cantidad: {att.quantity} {att.unit}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#5A736F' }}>{att.responsibleOrg}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#167C55', fontWeight: 700 }}>
                            <CheckCircle2 size={13} /> Recibido
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bloque 2: Citas de Seguimiento */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2EAE7',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(9, 77, 70, 0.04)'
            }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={18} color="#094D46" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#142724', margin: 0 }}>
                Evolución y Próximas Citas de Seguimiento ({myFollowups.length})
              </h3>
            </div>

            {myFollowups.length === 0 ? (
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAF9', borderRadius: '8px', color: '#6A8480', fontSize: '0.85rem' }}>
                No registras citas pendientes de seguimiento en este momento.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>FECHA REPORTE</th>
                      <th>ESTADO DE TU CASO</th>
                      <th>OBSERVACIÓN / AVANCE</th>
                      <th>PRÓXIMO CONTACTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFollowups.map(fol => (
                      <tr key={fol.id}>
                        <td style={{ fontWeight: 600, color: '#5A736F' }}>{fol.date}</td>
                        <td>
                          <span style={{ backgroundColor: '#FEF7EA', color: '#966708', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                            {fol.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.84rem', color: '#39524E' }}>{fol.observation}</td>
                        <td>
                          <TrafficLightBadge nextContactDate={fol.nextContactDate} status={fol.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      <Toast message={feedbackMessage} onClose={() => setFeedbackMessage(null)} />
    </div>
  );
}
