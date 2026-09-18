import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const META = {
  success: { Icon: CheckCircle2, title: 'Operación exitosa' },
  error: { Icon: AlertCircle, title: 'No fue posible completar la acción' },
  warning: { Icon: AlertTriangle, title: 'Atención' },
  info: { Icon: Info, title: 'Información' }
};

export function FeedbackCard({ type = 'info', title, message, onClose, compact = false, className = '' }) {
  const normalized = META[type] ? type : 'info';
  const { Icon, title: defaultTitle } = META[normalized];
  if (!message) return null;

  return (
    <div className={`feedback-card feedback-card-${normalized} ${compact ? 'feedback-card-compact' : ''} ${className}`.trim()} role={normalized === 'error' ? 'alert' : 'status'}>
      <div className="feedback-card-icon"><Icon size={20} /></div>
      <div className="feedback-card-content">
        <strong>{title || defaultTitle}</strong>
        <span>{message}</span>
      </div>
      {onClose && (
        <button type="button" className="feedback-card-close" onClick={onClose} aria-label="Cerrar mensaje">
          <X size={17} />
        </button>
      )}
    </div>
  );
}
