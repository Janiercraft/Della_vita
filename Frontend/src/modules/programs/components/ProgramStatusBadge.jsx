import React from 'react';
import { Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export function ProgramStatusBadge({ status = 'inscrito', className = '' }) {
  const config = {
    inscrito: {
      label: 'Inscrito',
      variant: 'badge-warning',
      icon: Clock
    },
    en_proceso: {
      label: 'En Proceso',
      variant: 'badge-info',
      icon: PlayCircle
    },
    finalizado: {
      label: 'Finalizado',
      variant: 'badge-success',
      icon: CheckCircle2
    },
    retirado: {
      label: 'Retirado',
      variant: 'badge-danger',
      icon: XCircle
    }
  };

  const current = config[status] || config.inscrito;
  const Icon = current.icon;

  return (
    <span className={`badge ${current.variant} ${className}`.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <Icon size={12} />
      <span>{current.label}</span>
    </span>
  );
}
