import React, { useState } from 'react';
import { useAuth, DEFAULT_ACCOUNTS } from '../../core/auth/AuthContext';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import ConsortiumLogos from '../../shared/layout/ConsortiumLogos';
import {
  Shield,
  ShieldCheck,
  User,
  Briefcase,
  KeyRound,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Paperclip,
  MapPin,
  AlertCircle
} from 'lucide-react';

export function LoginView() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('ben-001');
  const [email, setEmail] = useState('admin@uraba.org');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const beneficiariesList = beneficiaryRepository.getAll() || [];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    const account = DEFAULT_ACCOUNTS[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const handleQuickFill = () => {
    const account = DEFAULT_ACCOUNTS[selectedRole];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
    setErrorMessage('');
  };

  // Etiqueta de la clave de prueba según rol seleccionado
  const passwordHint = {
    admin: 'coordinadora',
    profesional: 'profesional',
    usuario: 'usuario'
  }[selectedRole] || selectedRole;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = login(
      selectedRole,
      email,
      password,
      selectedRole === 'usuario' ? selectedBeneficiaryId : null
    );

    if (!res.success) {
      setErrorMessage(res.message || 'Credenciales inválidas.');
    }
  };

  return (
    <>
      <style>{`
        .login-split-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background-color: #063630;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }

        /* Columna Izquierda: Mitad Exacta 50% con Fotografía y Emblema Superpuesto */
        .login-left-pane {
          width: 50%;
          flex: 0 0 50%;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background-color: #04211D;
        }

        .login-left-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Capa oscura con gradiente para garantizar contraste y elegancia */
        .login-left-dimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(6, 44, 38, 0.35) 0%, rgba(4, 28, 24, 0.25) 50%, rgba(3, 20, 17, 0.65) 100%);
          pointer-events: none;
          z-index: 2;
        }

        /* Emblema Superpuesto sobre la Foto con Tarjeta de Cristal Frosted */
        .login-left-emblem-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 4;
          width: 90%;
          max-width: 480px;
          pointer-events: none;
        }

        .login-glass-card {
          background: rgba(6, 44, 38, 0.93);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          padding: 2.25rem 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        /* Columna Derecha: Mitad Exacta 50% con Formulario de Acceso Espacioso */
        .login-right-pane {
          width: 50%;
          flex: 0 0 50%;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: #FFFFFF;
          box-sizing: border-box;
          box-shadow: -10px 0 45px rgba(0, 0, 0, 0.25);
          z-index: 10;
          overflow-y: auto;
        }

        .login-form-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          max-width: 530px;
          margin: 0 auto;
          padding: 3rem 2.5rem 2rem 2.5rem;
          box-sizing: border-box;
        }

        .login-role-card {
          cursor: pointer;
          padding: 1.25rem 1rem;
          border-radius: 14px;
          text-align: center;
          transition: all 0.2s ease;
          user-select: none;
        }

        .login-role-card.active {
          border: 2px solid #0D5C53;
          background-color: #F0FDF8;
          box-shadow: 0 6px 20px rgba(13, 92, 83, 0.14);
          transform: translateY(-2px);
        }

        .login-role-card.inactive {
          border: 1.5px solid #E2EAE7;
          background-color: #FFFFFF;
        }

        .login-role-card.inactive:hover {
          border-color: #B2D0C8;
          background-color: #F8FCFA;
          transform: translateY(-1px);
        }

        .login-input {
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid #CFDDD8;
          font-size: 0.98rem;
          color: #11221F;
          outline: none;
          background-color: #FFFFFF;
          box-sizing: border-box;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .login-input:focus {
          border-color: #0D5C53;
          box-shadow: 0 0 0 3.5px rgba(13, 92, 83, 0.14);
        }

        .login-submit-btn {
          margin-top: 0.6rem;
          background-color: #094D46;
          color: #FFFFFF;
          border: none;
          border-radius: 11px;
          height: 52px;
          padding: 0.9rem 1.5rem;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          box-shadow: 0 4px 16px rgba(9, 77, 70, 0.28);
          transition: all 0.2s ease;
        }

        .login-submit-btn:hover {
          background-color: #063630;
          transform: translateY(-2px);
          box-shadow: 0 7px 22px rgba(9, 77, 70, 0.34);
        }

        .login-submit-btn:active {
          transform: translateY(0);
        }

        /* Reglas Responsive y Adaptabilidad */
        @media (max-width: 1100px) {
          .login-form-wrapper {
            max-width: 480px;
            padding: 2.25rem 1.75rem;
          }
        }

        @media (max-width: 900px) {
          .login-split-container {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            max-height: none;
            overflow-y: auto;
          }
          .login-left-pane {
            width: 100%;
            flex: none;
            height: 250px;
          }
          .login-left-glass-card {
            padding: 1.25rem 1.5rem;
            max-width: 92%;
          }
          .login-left-glass-title {
            font-size: 1.6rem !important;
          }
          .login-right-pane {
            width: 100%;
            flex: none;
            height: auto;
            min-height: calc(100vh - 250px);
            max-height: none;
            box-shadow: none;
          }
          .login-form-wrapper {
            max-width: 100%;
            padding: 2.25rem 1.5rem;
          }
        }

        @media (max-width: 520px) {
          .login-left-pane {
            height: 210px;
          }
          .login-left-glass-card {
            padding: 0.9rem 1.1rem;
          }
          .login-left-glass-title {
            font-size: 1.35rem !important;
          }
          .login-role-grid {
            grid-template-columns: 1fr !important;
          }
          .login-form-wrapper {
            padding: 1.75rem 1.15rem;
          }
          .login-main-title {
            font-size: 1.75rem !important;
          }
        }
      `}</style>

      <div className="login-split-container">
        {/* ========================================================= */}
        {/* MITAD IZQUIERDA (50%): FOTOGRAFÍA CON TEXTO Y LOGO ENCIMA */}
        {/* ========================================================= */}
        <div className="login-left-pane">
          {/* Fotografía comunitaria de fondo */}
          <img
            src="/login-hero.jpg"
            alt="Aula rural comunitaria en Urabá - URABÁ-PAÍS"
            className="login-left-img"
          />

          {/* Filtro degradado para realce fotográfico y contraste */}
          <div className="login-left-dimmer" />

          {/* Emblema con tarjeta de cristal súper nítida y legible */}
          <div className="login-left-emblem-overlay">
            {/* Escudo + Título: sin caja de fondo, directo sobre la foto */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  marginBottom: '0.5rem'
                }}
              >
                {/* Escudo con degradado verde esmeralda institucional */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '15px',
                    background: 'linear-gradient(135deg, #26AEA2 0%, #0F6E64 100%)',
                    boxShadow: '0 8px 22px rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)'
                  }}
                >
                  <Shield size={28} strokeWidth={2.4} />
                </div>

                {/* Título Oficial */}
                <span
                  className="login-left-glass-title"
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 16px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.5)',
                    lineHeight: 1
                  }}
                >
                  URABÁ-PAÍS
                </span>
              </div>

              {/* Subtítulo — sin fondo, solo sombra para legibilidad */}
              <div
                style={{
                  fontSize: '1.02rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)',
                  marginBottom: '0.9rem',
                  textAlign: 'center'
                }}
              >
                Sistema Integrado de Gestión Humanitaria
              </div>

              {/* Píldora de localización — ESTA sí conserva su fondo oscuro */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(4, 30, 26, 0.85)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '24px',
                  padding: '0.35rem 1rem',
                  fontSize: '0.82rem',
                  color: '#E0EFEB',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
                }}
              >
                <MapPin size={13} color="#42D8B8" />
                <span>Apartadó • Turbo • Necoclí</span>
              </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MITAD DERECHA (50%): PANEL DE LOGIN CÉNTRICO Y ESPACIOSO  */}
        {/* ========================================================= */}
        <div className="login-right-pane">
          {/* Cuerpo Central del Formulario (con vertical centering natural) */}
          <div className="login-form-wrapper">
            {/* Badge Institucional Superior */}
            <div style={{ marginBottom: '0.65rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#EBF6F4',
                  color: '#094D46',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                <ShieldCheck size={15} strokeWidth={2.4} />
                Acceso Seguro al Sistema
              </span>
            </div>

            {/* Título Principal */}
            <h1
              className="login-main-title"
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#11221F',
                letterSpacing: '-0.025em',
                lineHeight: 1.18,
                margin: '0 0 0.45rem 0'
              }}
            >
              Iniciar Sesión
            </h1>

            <p
              style={{
                fontSize: '0.98rem',
                color: '#526964',
                margin: '0 0 1.65rem 0',
                lineHeight: 1.5
              }}
            >
              Selecciona tu tipo de acceso para ingresar a la plataforma
            </p>

            {/* Selector de Rol */}
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#142724',
                marginBottom: '0.65rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              1. SELECCIONA TU ROL:
            </div>

            {/* 3 ROLES: COORDINADORA, PROFESIONAL CLA, USUARIO */}
            <div
              className="login-role-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.4rem'
              }}
            >
              {/* Tarjeta Rol 1: Coordinadora */}
              <div
                onClick={() => handleRoleChange('admin')}
                className={`login-role-card ${selectedRole === 'admin' ? 'active' : 'inactive'}`}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    backgroundColor: selectedRole === 'admin' ? '#DDF4EE' : '#F1F5F4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.55rem auto',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ShieldCheck size={22} color="#0D5C53" strokeWidth={2.4} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#11221F', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Coordinadora
                </div>
                <div style={{ fontSize: '0.74rem', color: '#55726D', marginTop: '3px', fontWeight: 500 }}>
                  Acceso total
                </div>
              </div>

              {/* Tarjeta Rol 2: Profesional CLA */}
              <div
                onClick={() => handleRoleChange('profesional')}
                className={`login-role-card ${selectedRole === 'profesional' ? 'active' : 'inactive'}`}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    backgroundColor: selectedRole === 'profesional' ? '#DBEEFE' : '#F1F5F4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.55rem auto',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Briefcase size={21} color="#1D6FBA" strokeWidth={2.4} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#11221F', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Profesional CLA
                </div>
                <div style={{ fontSize: '0.74rem', color: '#55726D', marginTop: '3px', fontWeight: 500 }}>
                  Módulos esenciales
                </div>
              </div>

              {/* Tarjeta Rol 3: Usuario / Beneficiario */}
              <div
                onClick={() => handleRoleChange('usuario')}
                className={`login-role-card ${selectedRole === 'usuario' ? 'active' : 'inactive'}`}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    backgroundColor: selectedRole === 'usuario' ? '#F3E8FF' : '#F1F5F4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.55rem auto',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <User size={21} color="#7C3AED" strokeWidth={2.4} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#11221F', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Usuario
                </div>
                <div style={{ fontSize: '0.74rem', color: '#55726D', marginTop: '3px', fontWeight: 500 }}>
                  Portal beneficiario
                </div>
              </div>
            </div>

            {/* Formulario de Credenciales */}
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Campo Usuario o Correo Electrónico */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#1E3A34',
                    marginBottom: '0.45rem'
                  }}
                >
                  Usuario o Correo Electrónico:
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail
                    size={19}
                    color="#7C928E"
                    style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                    style={{
                      padding: '0.85rem 1rem 0.85rem 2.85rem',
                      height: '50px'
                    }}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.45rem'
                  }}
                >
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A34' }}>
                    Contraseña:
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D5C53',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: 0
                    }}
                    title="Cargar credenciales automáticas"
                  >
                    <Paperclip size={14} strokeWidth={2.4} />
                    <span>Autocompletar clave</span>
                  </button>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound
                    size={19}
                    color="#7C928E"
                    style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                    style={{
                      padding: '0.85rem 2.85rem 0.85rem 2.85rem',
                      height: '50px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8A9E9A',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6A8480', marginTop: '0.4rem', fontWeight: 500 }}>
                  Clave de prueba: <strong style={{ color: '#094D46', fontWeight: 700 }}>{passwordHint}</strong>
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#FDF2F2',
                    border: '1px solid #F8B4B4',
                    borderRadius: '9px',
                    padding: '0.65rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontSize: '0.84rem',
                    color: '#9B1C1C'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botón Ingresar */}
              <button type="submit" className="login-submit-btn">
                <span>Ingresar al Sistema</span>
                <ArrowRight size={19} strokeWidth={2.4} />
              </button>
            </form>
          </div>

          {/* Pie Institucional del Consorcio con Logos */}
          <div
            style={{
              padding: '1.25rem 2rem 1.4rem 2rem',
              textAlign: 'center',
              borderTop: '1px solid #EAEFEF',
              backgroundColor: '#F9FCFB',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: '#374151',
                fontWeight: 800,
                marginBottom: '0.65rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              CONSORCIO HUMANITARIO LÍDER DEL PROYECTO
            </div>

            {/* Contenedor Oscuro con los Logos Oficiales */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#072C27',
                borderRadius: '12px',
                padding: '0.5rem 1.35rem',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              <ConsortiumLogos style={{ gap: '1rem', padding: '0.15rem 0' }} />
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: '#7B948F',
                marginTop: '0.65rem'
              }}
            >
              Habeas Data • Tratamiento Ético y Confidencial de Información Humanitaria
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginView;
