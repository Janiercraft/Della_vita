import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { LoginView } from './modules/auth/LoginView';
import { BeneficiaryPortalView } from './modules/citizen/BeneficiaryPortalView';
import { AiChatWidget } from './shared/components/AiChatWidget';
import { Sidebar } from './shared/layout/Sidebar';
import { Navbar } from './shared/layout/Navbar';
import { BeneficiariesView } from './modules/beneficiaries/BeneficiariesView';
import { ProgramsView } from './modules/programs/ProgramsView';
import { AttentionsView } from './modules/attentions/AttentionsView';
import { ReportsView } from './modules/reports/ReportsView';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { ShieldAlert, X } from 'lucide-react';

// Mapeo Canónico de Rutas URL y Niveles de Autorización (Route Guard)
const ROUTE_CONFIG = {
  '#/login': { tab: 'login', minRole: 'public' },
  '#/beneficiarios': { tab: 'beneficiaries', minRole: 'staff' },
  '#/programas': { tab: 'programs', minRole: 'staff' },
  '#/atenciones': { tab: 'attentions', minRole: 'staff' },
  '#/reportes': { tab: 'reports', minRole: 'staff' },
  '#/portal': { tab: 'portal', minRole: 'any' }
};

const TAB_TO_HASH = {
  beneficiaries: '#/beneficiarios',
  programs: '#/programas',
  attentions: '#/atenciones',
  reports: '#/reportes',
  portal: '#/portal'
};

// Layout Principal con Route Guard Activo, Gestión de Roles y Chatbot Flotante
function MainLayout() {
  const { role, isAuthenticated } = useAuth();
  // Staff = todo rol que no sea beneficiario/usuario
  const isStaff = role === 'admin' || role === 'coordinador' || role === 'profesional';
  // Solo la Coordinadora puede aprobar/rechazar coincidencias de nombre
  const canApproveConflicts = role === 'admin' || role === 'coordinador';
  const [activeTab, setActiveTab] = useState(isStaff ? 'beneficiaries' : 'portal');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);

  // ROUTE GUARD: Intercepta cualquier manipulación manual de la URL en la barra de direcciones
  useEffect(() => {
    const evaluateRouteGuard = () => {
      const rawHash = window.location.hash || '';

      // 1. Si NO está autenticado:
      if (!isAuthenticated) {
        if (rawHash && rawHash !== '#/login' && rawHash !== '#/') {
          // Bloquea cualquier ruta administrativa o privada escrita manualmente
          window.location.hash = '#/login';
        }
        return;
      }

      // 2. Si ESTÁ autenticado:
      // Si la URL es login o vacía, redirigir a su pantalla autorizada según rol
      if (!rawHash || rawHash === '#/' || rawHash === '#/login') {
        const defaultHash = isStaff ? '#/beneficiarios' : '#/portal';
        window.location.hash = defaultHash;
        setActiveTab(isStaff ? 'beneficiaries' : 'portal');
        return;
      }

      // Evaluar la ruta solicitada manualmente
      const matchedRoute = ROUTE_CONFIG[rawHash];

      // A) Ruta desconocida (404 manual)
      if (!matchedRoute) {
        const safeHash = isStaff ? '#/beneficiarios' : '#/portal';
        window.location.hash = safeHash;
        setActiveTab(isStaff ? 'beneficiaries' : 'portal');
        return;
      }

      // B) Intento de acceso de un Usuario a módulos de administración (Staff)
      if (matchedRoute.minRole === 'staff' && !isStaff) {
        // BLOQUEO INMEDIATO: Redirección al portal y alerta de seguridad
        window.location.hash = '#/portal';
        setActiveTab('portal');
        setSecurityAlert({
          message: `Acceso restringido a "${rawHash}": Tu perfil no tiene autorización para acceder a módulos administrativos.`,
          timestamp: Date.now()
        });
        setTimeout(() => setSecurityAlert(null), 6000);
        return;
      }

      // C) Ruta autorizada: sincroniza la pestaña activa
      setActiveTab(matchedRoute.tab);
    };

    // Evaluar al montar y ante cualquier evento hashchange (escritura manual en la barra de URL)
    evaluateRouteGuard();
    window.addEventListener('hashchange', evaluateRouteGuard);
    return () => window.removeEventListener('hashchange', evaluateRouteGuard);
  }, [isAuthenticated, role, isStaff]);

  // Manejador de selección de pestañas desde la interfaz con actualización de URL
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (TAB_TO_HASH[tabId]) {
      window.location.hash = TAB_TO_HASH[tabId];
    }
  };

  // Barrera 1 de Seguridad: Si no hay autenticación, se desmonta todo y se renderiza SOLO LoginView
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const getTabTitle = () => {
    if (role === 'usuario') {
      return 'Portal de Autogestión del Beneficiario';
    }
    switch (activeTab) {
      case 'beneficiaries':
        return 'Beneficiarios y Familias';
      case 'programs':
        return 'Programas y Participación';
      case 'attentions':
        return 'Atención y Seguimiento';
      case 'reports':
        return 'Consultas y Ficha 360°';
      default:
        return 'Beneficiarios y Familias';
    }
  };

  return (
    <div className={`app-container ${!isStaff ? 'portal-home-mode' : ''}`}>
      {/* Barra lateral institucional: Solo activa para el equipo administrativo (Staff) */}
      {isStaff && (
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />
      )}

      {/* Área de Contenido Principal Adaptada a Pantalla Completa para el Usuario */}
      <div className={`main-content ${!isStaff ? 'portal-main-full' : ''}`}>
        <Navbar
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          activeTabName={getTabTitle()}
        />

        {/* Alerta de Seguridad por Intento de Acceso Manual No Autorizado */}
        {securityAlert && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              borderBottom: '1.5px solid #F87171',
              color: '#991B1B',
              padding: '0.65rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              fontWeight: 600,
              zIndex: 950,
              position: 'sticky',
              top: '68px',
              boxShadow: '0 2px 8px rgba(153, 27, 27, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <ShieldAlert size={16} />
              <span>{securityAlert.message}</span>
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#991B1B',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}
              title="Cerrar alerta"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Barrera 2 de Seguridad: Renderizado Condicional Estricto por Rol */}
        <main className={role === 'usuario' ? "page-wrapper portal-page-wrapper" : "page-wrapper"}>
          <ErrorBoundary key={`${role}-${activeTab}`}>
            {role === 'usuario' ? (
              <BeneficiaryPortalView />
            ) : (
              <>
                {activeTab === 'beneficiaries' && <BeneficiariesView />}
                {activeTab === 'programs' && <ProgramsView />}
                {activeTab === 'attentions' && <AttentionsView />}
                {activeTab === 'reports' && <ReportsView />}
              </>
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Widget de Asistente de IA Flotante (Disponible para ambos roles) */}
      <AiChatWidget />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
