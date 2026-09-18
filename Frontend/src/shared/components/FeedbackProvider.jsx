import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Toast } from './Modal';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);

  const notify = useCallback((message, type = 'info') => {
    const text = typeof message === 'string' ? message : message?.text || message?.message || '';
    const resolvedType = typeof message === 'object' && message?.type ? message.type : type;
    if (text) setFeedback({ type: resolvedType, text });
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => notify(String(message || ''), 'warning');
    return () => { window.alert = originalAlert; };
  }, [notify]);

  return (
    <FeedbackContext.Provider value={{ notify }}>
      {children}
      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return context;
}
