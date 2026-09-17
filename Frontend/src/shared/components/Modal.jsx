import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = message.type === 'success';
  const isError = message.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg)',
        backgroundColor: isSuccess ? 'var(--color-primary-dark)' : isError ? 'var(--status-danger-text)' : '#1E293B',
        color: '#FFFFFF',
        fontSize: '0.875rem',
        fontWeight: '500',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <span>{message.text}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
