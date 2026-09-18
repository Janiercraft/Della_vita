import React, { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { apiFetch } from '../../core/api/apiClient';
import InteractiveLogoCarousel from '../../shared/layout/InteractiveLogoCarousel';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  ServerCog,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => apiFetch.getBaseUrl());
  const [serverMessage, setServerMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Credenciales inválidas.');
    }
  };

  const handleSaveServer = () => {
    setServerMessage('');
    try {
      const normalized = apiFetch.setBaseUrl(serverUrl);
      setServerUrl(normalized);
      setServerMessage('URL de la API guardada correctamente.');
      setErrorMessage('');
    } catch {
      setServerMessage('No fue posible guardar la URL de la API.');
    }
  };

  const handleResetServer = () => {
    const defaultUrl = apiFetch.resetBaseUrl();
    setServerUrl(defaultUrl);
    setServerMessage('Se restauró la URL predeterminada.');
  };

  return (
    <>
      <style>{`
        /* ========================================================= */
        /* CONTENEDOR FULLSCREEN CON AMBIENTACIÓN CINEMATOGRÁFICA    */
        /* ========================================================= */
        .login-fullscreen-root {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          height: 100vh;
          margin: 0;
          padding: 0;
          background-color: #031815;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Fotografía de Fondo Panorámica a Pantalla Completa */
        .login-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.65) contrast(1.1);
          transform: scale(1.02);
          transition: transform 10s ease-out;
        }

        /* Capas de Gradiente para Máximo Contraste y Look Ejecutivo */
        .login-bg-dimmer {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 25% 35%, rgba(13, 92, 83, 0.45) 0%, transparent 65%),
                      radial-gradient(circle at 80% 75%, rgba(6, 44, 38, 0.6) 0%, transparent 60%),
                      linear-gradient(135deg, rgba(3, 20, 17, 0.88) 0%, rgba(4, 31, 27, 0.8) 50%, rgba(2, 13, 11, 0.94) 100%);
          pointer-events: none;
          z-index: 1;
        }

        /* Esferas de Luz Ambiental con Pulso Sutil */
        .login-orb-1 {
          position: absolute;
          top: 10%;
          left: 8%;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(42, 186, 168, 0.2) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 2;
          animation: orbPulse 9s ease-in-out infinite alternate;
        }

        .login-orb-2 {
          position: absolute;
          bottom: 8%;
          right: 10%;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 117, 106, 0.28) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
          z-index: 2;
          animation: orbPulse 13s ease-in-out infinite alternate-reverse;
        }

        @keyframes orbPulse {
          0% {
            transform: scale(1) translateY(0);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.15) translateY(-25px);
            opacity: 1;
          }
        }

        /* Contenedor Principal Adaptable a Pantalla Completa */
        .login-main-stage {
          position: relative;
          z-index: 10;
          width: 92%;
          max-width: 1240px;
          height: auto;
          max-height: 94vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3.5rem;
          box-sizing: border-box;
        }

        /* Columna Izquierda: Información Institucional y Propósito */
        .login-hero-info {
          flex: 1;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          color: #FFFFFF;
        }

        .login-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 30px;
          padding: 0.45rem 1.15rem;
          width: fit-content;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .login-hero-title {
          font-size: 3.1rem;
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -0.035em;
          margin: 0;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
        }

        .login-hero-highlight {
          background: linear-gradient(135deg, #4EE4CB 0%, #20BFA8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-hero-desc {
          font-size: 1.08rem;
          line-height: 1.65;
          color: #C3E0D8;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        /* Tarjetas de Métricas / Pilares en la Columna Izquierda */
        .login-pillars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .login-pillar-card {
          background: rgba(4, 28, 24, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 0.95rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          transition: all 0.25s ease;
        }

        .login-pillar-card:hover {
          border-color: rgba(78, 228, 203, 0.35);
          background: rgba(4, 35, 30, 0.75);
          transform: translateY(-2px);
        }

        /* ========================================================= */
        /* TARJETA DE ACCESO GLASSMORPHIC (DERECHA / CÉNTRICA)      */
        /* ========================================================= */
        .login-glass-portal {
          width: 460px;
          flex-shrink: 0;
          background: rgba(5, 34, 29, 0.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          border-radius: 24px;
          padding: 2.25rem 2.25rem 1.75rem 2.25rem;
          box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.6),
                      0 0 0 1px rgba(78, 228, 203, 0.12),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        /* Inputs estilizados para Glassmorphism de Alto Contraste */
        .login-glass-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          font-size: 0.96rem;
          color: #FFFFFF;
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .login-glass-input::placeholder {
          color: #8BA8A1;
        }

        .login-glass-input:focus {
          border-color: #4EE4CB;
          background: rgba(255, 255, 255, 0.14);
          box-shadow: 0 0 0 4px rgba(78, 228, 203, 0.22);
        }

        /* Botón de Acceso Principal Premium */
        .login-cta-button {
          margin-top: 0.75rem;
          background: linear-gradient(135deg, #18988B 0%, #0E6C62 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          height: 52px;
          padding: 0.85rem 1.5rem;
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: -0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          box-shadow: 0 6px 20px rgba(24, 152, 139, 0.35);
          transition: all 0.25s ease;
        }

        .login-cta-button:hover {
          background: linear-gradient(135deg, #22B2A3 0%, #127E72 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(24, 152, 139, 0.45);
        }

        .login-cta-button:active {
          transform: translateY(0);
        }

        /* Adaptabilidad Responsive */
        @media (max-width: 1080px) {
          .login-main-stage {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            max-height: none;
            padding: 2.5rem 1rem;
            overflow-y: auto;
          }
          .login-fullscreen-root {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .login-hero-info {
            text-align: center;
            align-items: center;
            max-width: 100%;
          }
          .login-hero-title {
            font-size: 2.3rem;
          }
          .login-pillars-grid {
            display: none;
          }
          .login-glass-portal {
            width: 100%;
            max-width: 480px;
          }
        }

        @media (max-width: 520px) {
          .login-hero-title {
            font-size: 1.85rem;
          }
          .login-glass-portal {
            padding: 1.65rem 1.25rem 1.35rem 1.25rem;
          }
        }
      `}</style>

      <div className="login-fullscreen-root">
        {/* Fotografía de Fondo Panorámica */}
        <img
          src="/login-hero.jpg"
          alt="Comunidad Urabá-País"
          className="login-bg-img"
        />

        {/* Gradientes Oscuros de Contraste */}
        <div className="login-bg-dimmer" />

        {/* Luces Ambientales Suaves */}
        <div className="login-orb-1" />
        <div className="login-orb-2" />

        {/* Escenario Central */}
        <div className="login-main-stage">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: IDENTIDAD Y ALCANCE TERRITORIAL        */}
          {/* ========================================================= */}
          <div className="login-hero-info">
            {/* Badge Institucional */}
            <div className="login-hero-badge">
              <ShieldCheck size={16} color="#4EE4CB" strokeWidth={2.4} />
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#E0EFEB'
                }}
              >
                Consorcio Humanitario Urabá-País
              </span>
            </div>

            {/* Gran Titular */}
            <h1 className="login-hero-title">
              Sistema Integrado de <br />
              <span className="login-hero-highlight">Gestión Humanitaria</span>
            </h1>

            {/* Descripción del Sistema */}
            <p className="login-hero-desc">
              Plataforma oficial para el registro, atención técnica, acompañamiento psicosocial
              y seguimiento integral a beneficiarios y familias en el territorio.
            </p>

            {/* Tarjetas de Pilares Informativos */}
            <div className="login-pillars-grid">
              <div className="login-pillar-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(78, 228, 203, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4EE4CB',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Cobertura Territorial
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#A0C6BC' }}>
                    Apartadó • Turbo • Necoclí
                  </div>
                </div>
              </div>

              <div className="login-pillar-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(78, 228, 203, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4EE4CB',
                    flexShrink: 0
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Enfoque Integral
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#A0C6BC' }}>
                    Familias y Comunidades
                  </div>
                </div>
              </div>
            </div>

            {/* Píldora de Estado en Vivo */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontSize: '0.82rem',
                color: '#C6E4DC',
                fontWeight: 600
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#4EE4CB',
                  boxShadow: '0 0 10px #4EE4CB'
                }}
              />
              <span>Portal institucional protegido con encriptación activa</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: PORTAL DE ACCESO EN TARJETA DE CRISTAL   */}
          {/* ========================================================= */}
          <div className="login-glass-portal">
            {/* Emblema Superior de la Tarjeta */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.7rem'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: 'linear-gradient(135deg, #26AEA2 0%, #0F6E64 100%)',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)'
                  }}
                >
                  <Shield size={23} strokeWidth={2.4} />
                </div>
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                >
                  URABÁ-PAÍS
                </span>
              </div>
            </div>

            {/* Título Principal Centrado */}
            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                margin: '0 0 0.35rem 0',
                textAlign: 'center'
              }}
            >
              Iniciar Sesión
            </h2>

            <p
              style={{
                fontSize: '0.86rem',
                color: '#A8C9C1',
                margin: '0 0 1rem 0',
                textAlign: 'center'
              }}
            >
              Ingresa tus credenciales para acceder a la plataforma
            </p>

            {/* Configuración de servidor: permite cambiar producción sin recompilar */}
            <div
              style={{
                marginBottom: '1.25rem',
                border: '1px solid rgba(78, 228, 203, 0.2)',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.12)',
                overflow: 'hidden'
              }}
            >
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: '#CDE8E1',
                  padding: '0.72rem 0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.82rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ServerCog size={16} color="#4EE4CB" />
                  Configuración del servidor / API
                </span>
                {showServerConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showServerConfig && (
                <div style={{ padding: '0 0.85rem 0.85rem 0.85rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#A8C9C1',
                      marginBottom: '0.4rem',
                      fontWeight: 700
                    }}
                  >
                    BASE URL del backend
                  </label>
                  <input
                    type="url"
                    value={serverUrl}
                    onChange={(e) => {
                      setServerUrl(e.target.value);
                      setServerMessage('');
                    }}
                    placeholder="https://mi-backend.onrender.com"
                    className="login-glass-input"
                    style={{ padding: '0.72rem 0.8rem', height: '43px', fontSize: '0.82rem' }}
                  />
                  <div style={{ fontSize: '0.69rem', color: '#8FB4AA', marginTop: '0.4rem', lineHeight: 1.35 }}>
                    Puedes pegar solo el dominio. Si falta <strong>/api/v1</strong>, se añadirá automáticamente.
                  </div>

                  <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={handleSaveServer}
                      style={{
                        flex: 1,
                        border: '1px solid rgba(78, 228, 203, 0.4)',
                        borderRadius: '9px',
                        background: 'rgba(30, 161, 145, 0.18)',
                        color: '#E8FFFA',
                        padding: '0.55rem 0.7rem',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Save size={14} /> Guardar URL
                    </button>
                    <button
                      type="button"
                      onClick={handleResetServer}
                      style={{
                        border: '1px solid rgba(255,255,255,0.16)',
                        borderRadius: '9px',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#BFD7D1',
                        padding: '0.55rem 0.7rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.74rem'
                      }}
                    >
                      Restaurar
                    </button>
                  </div>

                  {serverMessage && (
                    <div
                      style={{
                        marginTop: '0.55rem',
                        fontSize: '0.72rem',
                        color: serverMessage.includes('correctamente') ? '#7BE7D5' : '#D9E9E5'
                      }}
                    >
                      {serverMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Formulario de Inicio de Sesión */}
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              {/* Campo: Usuario o Correo Electrónico */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#E0EFEB',
                    marginBottom: '0.45rem'
                  }}
                >
                  Usuario o Correo Electrónico
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail
                    size={18}
                    color="#4EE4CB"
                    style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Correo o nombre de usuario"
                    className="login-glass-input"
                    style={{
                      padding: '0.85rem 1rem 0.85rem 2.85rem',
                      height: '48px'
                    }}
                  />
                </div>
              </div>

              {/* Campo: Contraseña (Sin Autocompletar Clave) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#E0EFEB',
                    marginBottom: '0.45rem'
                  }}
                >
                  Contraseña
                </label>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound
                    size={18}
                    color="#4EE4CB"
                    style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingresa tu contraseña"
                    className="login-glass-input"
                    style={{
                      padding: '0.85rem 2.85rem 0.85rem 2.85rem',
                      height: '48px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#A0C6BC',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#FFF1F2',
                    border: '1px solid #F6B8BE',
                    borderLeft: '4px solid #C83D4B',
                    borderRadius: '10px',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#8A2430',
                    boxShadow: '0 8px 20px rgba(200, 61, 75, 0.12)'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botón de Ingreso */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="login-cta-button"
              >
                <span>{isSubmitting ? 'Verificando...' : 'Ingresar al Sistema'}</span>
                <ArrowRight size={19} strokeWidth={2.4} />
              </button>
            </form>

            {/* Separador Sutil */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent)',
                margin: '1.4rem 0 1.1rem 0'
              }}
            />

            {/* Pie con Carrusel Interactivo de Logos Oficiales */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#95B8AF',
                  fontWeight: 800,
                  marginBottom: '0.55rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                CONSORCIO HUMANITARIO LÍDER DEL PROYECTO
              </div>

              <InteractiveLogoCarousel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginView;
