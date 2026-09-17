import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #FCA5A5',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '3rem auto',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={28} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>
            Ocurrió una eventualidad en este módulo
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Se ha prevenido que la pantalla quede en blanco. Puedes reintentar cargar la vista o contactar al equipo técnico.
          </p>

          {this.state.error?.message && (
            <div
              style={{
                backgroundColor: '#F9FAFB',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#4B5563',
                fontFamily: 'monospace',
                marginBottom: '1.5rem',
                textAlign: 'left',
                overflowX: 'auto'
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#094D46',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={16} />
              Reintentar Vista
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
