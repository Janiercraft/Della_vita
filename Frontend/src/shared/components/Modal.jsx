import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FeedbackCard } from './FeedbackCard';

export function Badge({ children, variant = 'primary', icon: Icon, className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export function Alert({ variant = 'info', children, icon: Icon, className = '' }) {
  return (
    <div className={`alert alert-${variant} ${className}`.trim()}>
      {Icon && <Icon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal-dialog ${size === 'lg' ? 'modal-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const normalized = typeof message === 'string'
    ? { type: type || 'info', text: message }
    : { type: message.type || type || 'info', text: message.text || message.message || '' };

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <FeedbackCard
        type={normalized.type}
        message={normalized.text}
        onClose={onClose}
        compact
      />
    </div>
  );
}
