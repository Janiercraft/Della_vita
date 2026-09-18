import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { apiAdapter } from '../../core/adapters/apiAdapter';
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
  const [quickPrompts, setQuickPrompts] = useState([]);
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

  // Sugerencias desde backend
  useEffect(() => {
    let cancel = false;
    const locales = (role === 'admin' || role === 'coordinador')
      ? ['Genera un resumen ejecutivo del proyecto', '¿Cuántos beneficiarios hay por municipio?']
      : role === 'profesional'
        ? ['¿Cuántas atenciones he registrado?']
        : ['¿Qué ayudas he recibido?', '¿En qué programas estoy?'];
    setQuickPrompts(locales);
    apiAdapter.getSugerenciasIa()
      .then((lista) => {
        if (!cancel && Array.isArray(lista) && lista.length) setQuickPrompts(lista);
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [role]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    setMessages((prev) => [...prev, {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const esResumen = /resumen ejecutivo/i.test(query) && (role === 'admin' || role === 'coordinador');
      const datos = esResumen
        ? await apiAdapter.resumenIa()
        : await apiAdapter.chatIa(query, currentUser?.rawId || currentUser?.beneficiaryId, role);
      const replyText = typeof datos === 'string'
        ? datos
        : (datos?.respuesta || datos?.mensaje || 'Sin respuesta del asistente.');
      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `No pude contactar al asistente IA.\n\nDetalle: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
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
