import React, { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { Menu, Check, Bell, LogOut, RefreshCw, User, Shield } from 'lucide-react';

export function Navbar({ onOpenMobileSidebar, activeTabName }) {
  const { currentUser, role, switchRole, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4EBE8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {role === 'usuario' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #1CA89D 0%, #094D46 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 10px rgba(9, 77, 70, 0.25)'
              }}
            >
              <Shield size={22} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#094D46', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                URABÁ-PAÍS
              </span>
              <span style={{ fontSize: '0.72rem', color: '#1CA89D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Portal de Autogestión Ciudadana
              </span>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onOpenMobileSidebar}
              className="hamburger-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb institucional */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#829994', fontWeight: 600 }}>URABÁ-PAÍS</span>
              <span style={{ color: '#BAC7C4', fontSize: '0.9rem' }}>&gt;</span>
              <span style={{ fontWeight: 700, color: '#094D46' }}>
                {activeTabName || 'Gestión Humanitaria'}
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>


        {/* Avatar y Datos del Usuario con Menú */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: role === 'admin' ? '#094D46' : '#1CA89D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
              boxShadow: '0 2px 6px rgba(9, 77, 70, 0.2)'
            }}
          >
            {currentUser?.avatarInitials || (role === 'admin' ? 'AD' : 'US')}
          </div>
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#142724', lineHeight: 1.2 }}>
              {currentUser?.name || 'Usuario'}
            </span>
            <span style={{ fontSize: '0.72rem', color: role === 'usuario' ? '#1CA89D' : '#094D46', fontWeight: 700 }}>
              {role === 'admin' && 'Administrador(a)'}
              {role === 'coordinador' && 'Coordinador(a)'}
              {role === 'profesional' && 'Profesional de Campo'}
              {role === 'usuario' && 'Usuario Beneficiario'}
            </span>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid #D2DFDC',
              borderRadius: '8px',
              color: '#65827D',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '0.25rem',
              transition: 'all 0.15s ease'
            }}
            title="Cerrar Sesión"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FDF2F2';
              e.currentTarget.style.color = '#DC2626';
              e.currentTarget.style.borderColor = '#FCA5A5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#65827D';
              e.currentTarget.style.borderColor = '#D2DFDC';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hamburger-btn { display: flex !important; }
          .navbar-badge { display: none !important; }
        }
        @media (max-width: 580px) {
          .user-info { display: none !important; }
        }
      `}</style>
    </header>
  );
}
