import React from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Modal';
import { Edit2, Users, MapPin, Phone, ShieldCheck, UserCheck, FolderGit2, Package, CalendarClock } from 'lucide-react';
import { programRepository } from '../../programs/services/programRepository';
import { ProgramStatusBadge } from '../../programs/components/ProgramStatusBadge';
import { attentionRepository } from '../../attentions/services/attentionRepository';

export function BeneficiaryDetailModal({
  isOpen,
  onClose,
  beneficiary,
  onEdit
}) {
  if (!beneficiary) return null;

  const familyMembers = beneficiary.familyMembers || [];
  const linkedPrograms = programRepository.getByBeneficiaryId(beneficiary.id);
  const linkedEvents = attentionRepository.getByBeneficiaryId(beneficiary.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Beneficiario"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(beneficiary);
              }}
            >
              Editar Información
            </Button>
          )}
        </>
      }
    >
      <div>
        {/* Cabecera del expediente */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                {beneficiary.internalCode}
              </span>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={13} /> Habeas Data Autorizado
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              {beneficiary.fullName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {beneficiary.documentType === 'SD' ? (
                <em style={{ color: 'var(--color-teal-soft)' }}>Sin documento registrado / En trámite</em>
              ) : (
                <span>{beneficiary.documentType}: <strong>{beneficiary.documentNumber}</strong></span>
              )}
              {beneficiary.birthDate && ` • Nacimiento: ${beneficiary.birthDate}`}
              {beneficiary.gender && ` • ${beneficiary.gender}`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-info">{beneficiary.populationGroup || 'Comunidad Local'}</span>
          </div>
        </div>

        {/* Datos de Ubicación y Contacto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-surface-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <MapPin size={14} color="var(--color-primary)" /> Territorio / Municipio
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {beneficiary.municipality} {beneficiary.communityZone ? `(${beneficiary.communityZone})` : ''}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {beneficiary.address || 'Sin dirección específica'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <Phone size={14} color="var(--color-primary)" /> Contacto
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {beneficiary.phone || 'Sin teléfono registrado'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Registrado: {beneficiary.registeredAt ? new Date(beneficiary.registeredAt).toLocaleDateString('es-CO') : 'Reciente'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <UserCheck size={14} color="var(--color-primary)" /> Condición Especial
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {beneficiary.hasDisability ? `Discapacidad (${beneficiary.disabilityDetails || 'Declarada'})` : 'Sin condición de discapacidad'}
            </div>
          </div>
        </div>

          {/* Núcleo Familiar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Núcleo Familiar Registrado ({familyMembers.length})
            </h4>

            {familyMembers.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                No se han registrado integrantes familiares para esta persona.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>Parentesco</th>
                      <th>Edad</th>
                      <th>Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map((fam) => (
                      <tr key={fam.id}>
                        <td style={{ fontWeight: 600 }}>{fam.fullName}</td>
                        <td>
                          <span className="badge badge-primary">{fam.kinship}</span>
                        </td>
                        <td>{fam.age ? `${fam.age} años` : 'N/D'}</td>
                        <td>
                          {fam.documentNumber ? `${fam.documentType || 'DOC'}: ${fam.documentNumber}` : 'Sin documento'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Programas y Proyectos Vinculados (Módulo 2) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderGit2 size={18} /> Programas y Proyectos Vinculados ({linkedPrograms.length})
            </h4>

            {linkedPrograms.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                Esta persona aún no cuenta con vinculaciones a programas.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Programa</th>
                      <th>Línea de Intervención</th>
                      <th>Fecha Vinculación</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedPrograms.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.programName}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {p.lineName}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{p.enrollmentDate}</td>
                        <td>
                          <ProgramStatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Atenciones y Seguimientos (Módulo 3) */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} /> Atenciones y Seguimientos Registrados ({linkedEvents.length})
            </h4>

            {linkedEvents.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                No se han registrado entregas de ayuda ni seguimientos para esta persona.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Detalle / Novedad</th>
                      <th>Estado / Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#5A736F' }}>{ev.date}</td>
                        <td>
                          {ev.type === 'attention' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#E8F7F1', color: '#178358', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                              <Package size={12} /> Ayuda
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF7EA', color: '#966708', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                              <CalendarClock size={12} /> Seguimiento
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.84rem' }}>
                          <div style={{ fontWeight: 600, color: '#142724' }}>
                            {ev.type === 'attention' ? ev.attentionTypeLabel : `Evolución: ${ev.status}`}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#647B77', marginTop: '2px' }}>
                            {ev.type === 'attention' ? ev.quantity : ev.observation}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#5A736F' }}>
                          {ev.type === 'attention' ? ev.responsibleOrg : (ev.nextContactDate ? `Próximo: ${ev.nextContactDate}` : 'Sin fecha')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </Modal>
  );
}
