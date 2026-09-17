import React from 'react';
import { Package, Sparkles, Heart, Stethoscope, Scale, Briefcase, GraduationCap, HelpCircle } from 'lucide-react';

export function AttentionTypeBadge({ typeId, label }) {
  const getBadgeStyle = () => {
    switch (typeId) {
      case 'kit_alimentos':
        return {
          icon: Package,
          bg: '#EBF3FC',
          color: '#1D6FBA',
          border: '#CFE3F9'
        };
      case 'kit_higiene':
        return {
          icon: Sparkles,
          bg: '#E5F6F6',
          color: '#0B7E7F',
          border: '#BCEAEA'
        };
      case 'atencion_psicosocial':
        return {
          icon: Heart,
          bg: '#FDF2F8',
          color: '#9D174D',
          border: '#FBCFE8'
        };
      case 'consulta_medica':
        return {
          icon: Stethoscope,
          bg: '#EFF6FF',
          color: '#1E40AF',
          border: '#BFDBFE'
        };
      case 'asesoria_legal':
        return {
          icon: Scale,
          bg: '#FAF5FF',
          color: '#6B21A8',
          border: '#E9D5FF'
        };
      case 'capital_semilla':
        return {
          icon: Briefcase,
          bg: '#E8F7F1',
          color: '#178358',
          border: '#C7EEDD'
        };
      case 'capacitacion_laboral':
        return {
          icon: GraduationCap,
          bg: '#FEF7EA',
          color: '#966708',
          border: '#F7E1B5'
        };
      default:
        return {
          icon: HelpCircle,
          bg: '#F0F4F3',
          color: '#39524E',
          border: '#DDE5E3'
        };
    }
  };

  const { icon: Icon, bg, color, border } = getBadgeStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.22rem 0.65rem',
        borderRadius: '6px',
        fontSize: '0.76rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2
      }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </span>
  );
}
