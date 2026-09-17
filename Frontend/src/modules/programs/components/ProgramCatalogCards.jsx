import React from 'react';
import { INTERVENTION_LINES } from '../../../core/constants';
import { Shield, HeartPulse, Briefcase, Users, Check } from 'lucide-react';

export function ProgramCatalogCards({
  enrollments = [],
  activeLineFilter = '',
  onSelectLine
}) {
  const getIcon = (id) => {
    switch (id) {
      case 'humanitarian': return Shield;
      case 'health': return HeartPulse;
      case 'economic': return Briefcase;
      default: return Users;
    }
  };

  const getTarget = (id) => {
    switch (id) {
      case 'humanitarian': return '~6.700 personas';
      case 'health': return '~2.911 personas';
      case 'economic': return '~1.836 personas';
      default: return '';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {INTERVENTION_LINES.map((line) => {
        const Icon = getIcon(line.id);
        const activeCount = enrollments.filter(e => e.lineId === line.id).length;
        const isSelected = activeLineFilter === line.id;

        return (
          <div
            key={line.id}
            className="card"
            onClick={() => onSelectLine(isSelected ? '' : line.id)}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-subtle)',
              backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-primary-light)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={22} />
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {activeCount} vinculados
              </span>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
              {line.name}
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-teal-text)', fontWeight: 600, marginBottom: '0.35rem' }}>
              Org: {line.org}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
              {line.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Meta Proyecto: <strong>{getTarget(line.id)}</strong></span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {isSelected ? <><Check size={13} /> Filtrando</> : 'Clic para filtrar'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
