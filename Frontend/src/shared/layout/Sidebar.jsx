import React from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { Users, FolderGit2, HeartHandshake, BarChart3, Shield, MapPin, X, BookOpen, UserCog, CalendarPlus } from 'lucide-react';
import ConsortiumLogos from './ConsortiumLogos';

export function Sidebar({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) {
  const { role, currentUser } = useAuth();

  const adminMenuItems = [
    {
      id: 'beneficiaries',
      label: 'Beneficiarios y Familias',
      icon: Users
    },
    {
      id: 'programs',
      label: 'Programas y Participación',
      icon: FolderGit2
    },
    {
      id: 'attentions',
      label: 'Atención y Seguimiento',
      icon: HeartHandshake
    },
    {
      id: 'reports',
      label: 'Consultas y Ficha 360°',
      icon: BarChart3
    },
    ...(role === 'admin' || role === 'coordinador' ? [
      { id: 'events', label: 'Crear / Gestionar Eventos', icon: CalendarPlus },
      { id: 'users', label: 'Usuarios y Roles', icon: UserCog }
    ] : [])
  ];

  const userMenuItems = [
    {
      id: 'portal',
      label: 'Mi Portal y Programas',
      icon: BookOpen
    }
  ];

  const isStaff = role !== 'usuario';
  const menuItems = isStaff ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-backdrop)',
            zIndex: 1100,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        className={`sidebar-container ${isOpenMobile ? 'open-mobile' : ''}`}
        style={{
          width: '260px',
          backgroundColor: '#063630',
          color: '#E0EBE9',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          overflowY: 'auto',
          zIndex: 1000,
          transition: 'transform var(--transition-fast)'
        }}
      >
        {/* Cabecera Sidebar con Logo Exacto */}
        <div
          style={{
            padding: '1.5rem 1.25rem 1rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#249E94',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Shield size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: '#FFFFFF', lineHeight: 1.1 }}>
                  URABÁ-PAÍS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#56DFBE', fontWeight: 500, marginTop: '2px' }}>
                  Gestión Humanitaria
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="mobile-close-btn"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'none',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Pill de Territorio */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.45rem 0.75rem',
              backgroundColor: '#0A433C',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#42D8B8',
              fontWeight: 500
            }}
          >
            <MapPin size={13} color="#42D8B8" />
            <span>Apartadó • Turbo • Necoclí</span>
          </div>
        </div>

        {/* Navegación por Módulos */}
        <nav style={{ flex: 1, padding: '1rem 0.875rem', overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#658D86',
              padding: '0 0.5rem 0.6rem 0.5rem',
              fontWeight: 700
            }}
          >
            MÓDULOS DEL RETO
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.85rem 0.875rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#0D5C54' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#AFC7C2',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#0A433C';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#88ACA5'} />
                    <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Pie del Sidebar */}
        <div
          style={{
            padding: '1.1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#88ACA5', lineHeight: 1.4, fontWeight: 500 }}>
            Iniciativa liderada por:
          </div>
          <ConsortiumLogos />

          <div
            style={{
              marginTop: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontWeight: 600, color: '#C8DDD8' }}>
              {currentUser?.title || (role === 'admin' || role === 'coordinador' ? 'Coordinador General' : role === 'profesional' ? 'Funcionario / Profesional' : 'Beneficiario(a) Titular')}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: '#07423B',
                color: '#3CE3BE',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#3CE3BE'
                }}
              />
              En Línea
            </span>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 960px) {
          .sidebar-container {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar-container.open-mobile {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
