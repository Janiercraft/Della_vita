import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { beneficiaryRepository } from '../../modules/beneficiaries/services/beneficiaryRepository';
import { programRepository } from '../../modules/programs/services/programRepository';
import { attentionRepository } from '../../modules/attentions/services/attentionRepository';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';

export function AiChatWidget() {
  const { role, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const messagesEndRef = useRef(null);

  // Ocultar el widget durante la impresión/exportación para no tapar el preview
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Inicializar mensajes de bienvenida según el rol
  useEffect(() => {
    if (role === 'admin') {
      setMessages([
        {
          id: 'welcome-admin',
          sender: 'ai',
          text: `Hola **${currentUser?.name || 'Administrador(a)'}**. Soy el Asistente Inteligente del Consorcio (COOPI, FADV, HIAS, HI). Puedo asistirte en tiempo real con estadísticas de cobertura territorial, semáforos de seguimiento, normativas y alertas en Apartadó, Turbo y Necoclí.`,
          timestamp: 'Ahora'
        }
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-user',
          sender: 'ai',
          text: `¡Hola **${currentUser?.name || 'Beneficiario(a)'}**! Soy el Asistente Virtual Comunitario de URABÁ-PAÍS. Estoy aquí para orientarte sobre cómo postularte a los programas de salud, emprendimiento y protección, resolver dudas de tus citas y ubicar las sedes de atención.`,
          timestamp: 'Ahora'
        }
      ]);
    }
  }, [role, currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Sugerencias rápidas context-aware
  const quickPrompts = role === 'admin' ? [
    '¿Cuántos beneficiarios y familias hay en el sistema?',
    '¿Cuántos casos están en semáforo rojo urgente?',
    '¿Qué programas tienen mayor participación?',
    '¿Qué regla aplica para personas sin documento?'
  ] : [
    '¿Cómo me postulo a los programas de emprendimiento?',
    '¿Qué documentos necesito para registrar a mis hijos?',
    '¿Dónde quedan las oficinas de atención en Apartadó?',
    '¿Cómo sé si tengo una ayuda o cita programada?'
  ];

  // Motor de Respuestas de IA contextual a los datos del proyecto
  const generateAiResponse = (query) => {
    const q = query.toLowerCase();

    // Contexto Admin
    if (role === 'admin') {
      if (q.includes('cuantos') || q.includes('cuántos') || q.includes('total') || q.includes('beneficiarios')) {
        const totalBens = beneficiaryRepository.getAll().length;
        const apartado = beneficiaryRepository.getByMunicipality('Apartadó').length;
        const turbo = beneficiaryRepository.getByMunicipality('Turbo').length;
        const necocli = beneficiaryRepository.getByMunicipality('Necoclí').length;
        return `Actualmente registramos **${totalBens} beneficiarios titulares** en el sistema.\n\n**Distribución Territorial:**\n• **Apartadó:** ${apartado} personas\n• **Turbo:** ${turbo} personas\n• **Necoclí:** ${necocli} personas\n\nTodos los datos cumplen con la directriz de disociación y anonimización en el Dashboard estadístico.`;
      }

      if (q.includes('rojo') || q.includes('urgente') || q.includes('semaforo') || q.includes('semáforo')) {
        const followups = attentionRepository.getFollowUps() || [];
        const urgent = followups.filter(f => f.status.toLowerCase().includes('urgente') || (f.nextContactDate && new Date(f.nextContactDate) < new Date()));
        return `**Alertas de Seguimiento:**\nIdentificamos **${urgent.length} casos con semáforo rojo o pendientes urgentes** que requieren contacto inmediato por parte de los profesionales de campo en territorio. Te recomiendo revisar el Módulo 3 en la pestaña de seguimiento.`;
      }

      if (q.includes('programa') || q.includes('participacion') || q.includes('lineas') || q.includes('líneas')) {
        const enrollments = programRepository.getAllEnrollments() || [];
        return `Se registran **${enrollments.length} vinculaciones activas** distribuidas en las 3 Líneas de Intervención:\n1. **Medios de Vida y Emprendimiento** (FADV/COOPI)\n2. **Protección e Inclusión de Derechos** (HIAS/COOPI)\n3. **Salud y Bienestar Integral** (HI/FADV)\n\nLas inscripciones evitan duplicados activos automáticamente por programa.`;
      }

      if (q.includes('documento') || q.includes('duplicado') || q.includes('regla')) {
        return `**Protocolo Humanitario para Indocumentados:**\nCuando una persona registra tipo de documento "SD" (Sin Documento), el sistema aplica coincidencia difusa por nombre completo, fecha de nacimiento y teléfono. La autorización final **es potestad exclusiva del Coordinador(a)** mediante casilla firmada.`;
      }

      return `Entendido. En el marco del Consorcio Urabá-País, superviso la trazabilidad de los 4 módulos operativos. Si tus compañeros conectan el backend de IA, procesaré modelos LLM más profundos. ¿Deseas consultar datos de cobertura o normativas?`;
    }

    // Contexto Usuario / Beneficiario
    if (q.includes('postulo') || q.includes('inscribo') || q.includes('emprendimiento') || q.includes('programa')) {
      return `Puedes postularte muy fácilmente aquí mismo en tu **Portal de Beneficiario**:\n\n1. Ve a la pestaña **"1. Catálogo de Programas"** arriba.\n2. Elige el programa que te interese (ej: *Fortalecimiento a Emprendimientos* o *Capacitación Técnico-Laboral*).\n3. Presiona el botón verde **"Solicitar Vinculación / Postularme"**.\n\nTu solicitud le llegará en vivo al equipo técnico de ${currentUser?.territory || 'tu municipio'} para admitirte.`;
    }

    if (q.includes('hijo') || q.includes('familia') || q.includes('documento')) {
      return `**Inclusión Familiar:**\nTus hijos y familiares registrados en el expediente quedan cubiertos bajo las ayudas institucionales del consorcio. Si alguno aún no tiene tarjeta de identidad o registro civil, el profesional te apoyará con la ruta de documentación sin costo.`;
    }

    if (q.includes('oficina') || q.includes('sede') || q.includes('donde') || q.includes('dónde')) {
      return `**Puntos de Atención Humanitaria:**\n• **Apartadó:** Sede Consorcio Calle 100 con Carrera 100\n• **Turbo:** Centro de Convivencia Ciudadana Barrio Obrero\n• **Necoclí:** Punto de Orientación Humanitaria Sector Totumo\n\nHorario de atención: Lunes a Viernes de 8:00 a.m. a 4:00 p.m.`;
    }

    if (q.includes('ayuda') || q.includes('cita') || q.includes('seguimiento')) {
      return `Para revisar las ayudas humanitarias que has recibido (kits de alimentos, subsidios o asesorías) y cuándo es tu próxima cita de seguimiento, abre la pestaña **"3. Mis Ayudas Recibidas y Citas"** en este portal.`;
    }

    return `Hola ${currentUser?.name?.split(' ')[0] || ''}, con gusto te ayudo. Puedes preguntarme sobre cómo postularte a los cursos, requisitos de tus familiares o información de las sedes de atención en Urabá.`;
  };

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simular procesamiento del asistente (tiempo de respuesta realista)
    setTimeout(() => {
      const replyText = generateAiResponse(query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Botón Flotante Persistente en Esquina Inferior Derecha */}
      <div
        data-widget="ai-chat"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1200,
          display: isPrinting ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          transition: 'opacity 0.2s ease'
        }}
      >
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#063630',
              color: '#FFFFFF',
              borderRadius: '30px',
              padding: '0.65rem 1.15rem',
              boxShadow: '0 8px 24px rgba(6, 54, 48, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              border: '2px solid #1CA89D',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(6, 54, 48, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 54, 48, 0.35)';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1CA89D',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.1 }}>
                Asistente IA
              </span>
              <span style={{ fontSize: '0.7rem', color: '#42D8B8', fontWeight: 600 }}>
                {role === 'admin' ? 'Asesoría de Gestión' : 'Orientación en Línea'}
              </span>
            </div>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                boxShadow: '0 0 8px #22C55E'
              }}
            />
          </div>
        )}

        {/* Ventana Desplegable del Chatbot */}
        {isOpen && (
          <div
            style={{
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              height: '520px',
              maxHeight: 'calc(100vh - 100px)',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1.5px solid #094D46',
              animation: 'slideUpChat 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Cabecera del Chat con Identidad Institucional */}
            <div
              style={{
                backgroundColor: '#063630',
                padding: '1rem 1.15rem',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #1CA89D'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: '#1CA89D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.2 }}>
                    Asistente URABÁ-PAÍS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#42D8B8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block' }} />
                    {role === 'admin' ? 'Modo Administrador' : 'Modo Beneficiario'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A0BDB8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
                title="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sugerencias Rápidas */}
            <div
              style={{
                backgroundColor: '#F8FAF9',
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid #E2EAE7',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    backgroundColor: '#FFFFFF',
                    color: '#094D46',
                    border: '1px solid #CADBD6',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#094D46'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CADBD6'}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Lista de Mensajes */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                backgroundColor: '#FAFCFB'
              }}
            >
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAi ? 'flex-start' : 'flex-end',
                      maxWidth: '88%',
                      alignSelf: isAi ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isAi ? '#FFFFFF' : '#094D46',
                        color: isAi ? '#142724' : '#FFFFFF',
                        padding: '0.75rem 0.95rem',
                        borderRadius: isAi ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                        border: isAi ? '1px solid #E2EAE7' : 'none',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#88A39E', marginTop: '3px', padding: '0 4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '14px',
                    border: '1px solid #E2EAE7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    alignSelf: 'flex-start'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#094D46', animation: 'bounce 1s infinite' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#094D46', animation: 'bounce 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#094D46', animation: 'bounce 1s infinite 0.4s' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensaje */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E4EBE8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={role === 'admin' ? 'Escribe una consulta de gestión...' : 'Escribe tu pregunta o duda aquí...'}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '20px',
                  border: '1.5px solid #CADBD6',
                  fontSize: '0.84rem',
                  color: '#142724',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#094D46'}
                onBlur={(e) => e.target.style.borderColor = '#CADBD6'}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: inputQuery.trim() ? '#094D46' : '#CADBD6',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease'
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media print {
          /* Ocultar completamente el widget del Asistente IA al imprimir/exportar PDF */
          [data-widget="ai-chat"] {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
