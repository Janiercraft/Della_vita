import React from 'react';
import { getFollowUpTrafficLight } from '../../../core/domain/attentionRules';
import { AlertCircle, Clock, CheckCircle2, Calendar } from 'lucide-react';

export function TrafficLightBadge({ nextContactDate, status = '' }) {
  const info = getFollowUpTrafficLight(nextContactDate, status);

  const renderIcon = () => {
    switch (info.level) {
      case 'danger':
        return <AlertCircle size={13} color="#DC2626" style={{ flexShrink: 0 }} />;
      case 'warning':
        return <Calendar size={13} color="#D97706" style={{ flexShrink: 0 }} />;
      case 'good':
        return <CheckCircle2 size={13} color="#167C55" style={{ flexShrink: 0 }} />;
      default:
        return <Clock size={13} color="#6A8480" style={{ flexShrink: 0 }} />;
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '6px',
        fontSize: '0.76rem',
        fontWeight: 700,
        backgroundColor: info.bg,
        color: info.color,
        border: `1px solid ${info.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
      title={info.label}
    >
      {renderIcon()}
      <span>{info.badgeText}</span>
    </span>
  );
}
