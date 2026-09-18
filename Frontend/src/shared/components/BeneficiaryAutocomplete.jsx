import React, { useState, useRef, useEffect, useMemo } from 'react';
import { textMatches } from '../../core/utils/textUtils';
import { Search, X, Check, UserCheck, AlertCircle, RotateCcw } from 'lucide-react';

export function BeneficiaryAutocomplete({
  beneficiaries = [],
  selectedId = '',
  onSelect,
  onClear,
  label = 'Beneficiario a vincular',
  required = false,
  error = '',
  helperText = ''
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Beneficiario seleccionado actualmente
  const selectedBeneficiary = useMemo(() => {
    return beneficiaries.find(b => b.id === selectedId) || null;
  }, [beneficiaries, selectedId]);

  // Filtrado en tiempo real insensible a tildes/acentos y mayúsculas
  const filteredBeneficiaries = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      // Muestra los primeros 8 como sugerencia inicial
      return beneficiaries.slice(0, 8);
    }
    return beneficiaries.filter(b => {
      const matchName = textMatches(b.fullName, trimmed);
      const matchCode = textMatches(b.internalCode, trimmed);
      const matchDoc = textMatches(b.documentNumber || '', trimmed);
      const matchMun = textMatches(b.municipality || '', trimmed);
      return matchName || matchCode || matchDoc || matchMun;
    }).slice(0, 20); // Límite de 20 para máximo rendimiento y fluidez
  }, [beneficiaries, query]);

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'BU').toUpperCase();
  };

  const handleSelect = (ben) => {
    onSelect(ben);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    if (onClear) onClear();
    setQuery('');
    setIsOpen(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative', marginBottom: '1.25rem' }}>
      {label && (
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            {label} {required && <span className="required" style={{ color: '#EF4444' }}>*</span>}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#6A8480', fontWeight: 400 }}>
            {beneficiaries.length} beneficiarios en base de datos
          </span>
        </label>
      )}

      {/* VISTA 1: BENEFICIARIO YA SELECCIONADO */}
      {selectedBeneficiary ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#F0F8F6',
            border: '1.5px solid #0D5C54',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(13, 92, 84, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1CA89D',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getInitials(selectedBeneficiary.fullName)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#142724' }}>
                  {selectedBeneficiary.fullName}
                </span>
                <span
                  style={{
                    backgroundColor: '#E4F5F1',
                    color: '#0E6D63',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  {selectedBeneficiary.internalCode}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#5A7571', marginTop: '2px' }}>
                {selectedBeneficiary.documentType === 'SD' ? (
                  <em>Sin documento / En trámite</em>
                ) : (
                  <span>{selectedBeneficiary.documentType}: <strong>{selectedBeneficiary.documentNumber}</strong></span>
                )}
                {' • '}
                <span>Municipio: <strong>{selectedBeneficiary.municipality}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #C8DDD8',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#0D5C54',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E6F4F1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
            title="Buscar otro beneficiario"
          >
            <RotateCcw size={13} />
            Cambiar
          </button>
        </div>
      ) : (
        /* VISTA 2: CAMPO DE BÚSQUEDA EN TIEMPO REAL */
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.875rem',
                color: '#6A8480',
                pointerEvents: 'none',
                display: 'flex'
              }}
            >
              <Search size={17} />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Escribe el nombre, código (ej. UP-2026) o cédula/PPT..."
              className={`form-control ${error ? 'border-danger' : ''}`}
              style={{
                paddingLeft: '2.5rem',
                paddingRight: query ? '2.5rem' : '1rem',
                height: '42px',
                borderRadius: '8px',
                borderColor: isOpen ? '#0D5C54' : '#D2DFDC'
              }}
              autoComplete="off"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8A9E9B',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* MENÚ FLOTANTE DE RESULTADOS EN TIEMPO REAL */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #C8DDD8',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                zIndex: 150,
                maxHeight: '270px',
                overflowY: 'auto'
              }}
            >
              {/* Encabezado del desplegable */}
              <div
                style={{
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#F7FAFA',
                  borderBottom: '1px solid #E6EFEB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: '#6A8480',
                  fontWeight: 600
                }}
              >
                <span>
                  {query.trim()
                    ? `Coincidencias para "${query}":`
                    : 'Beneficiarios disponibles (comienza a escribir para filtrar):'}
                </span>
                <span
                  style={{
                    backgroundColor: '#E4F5F1',
                    color: '#0E6D63',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}
                >
                  {filteredBeneficiaries.length} resultados
                </span>
              </div>

              {/* Lista de coincidencias */}
              {filteredBeneficiaries.length > 0 ? (
                <div>
                  {filteredBeneficiaries.map((ben) => {
                    const initials = getInitials(ben.fullName);
                    return (
                      <div
                        key={ben.id}
                        onClick={() => handleSelect(ben)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #F0F4F3',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0F8F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#1CA89D',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {initials}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#142724' }}>
                              {ben.fullName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6A8480', marginTop: '1px' }}>
                              <span style={{ fontWeight: 600, color: '#094D46' }}>{ben.internalCode}</span>
                              {' • '}
                              {ben.documentType === 'SD' ? (
                                <em>Sin documento</em>
                              ) : (
                                `${ben.documentType}: ${ben.documentNumber}`
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: '#F0F4F3',
                              color: '#2E4945',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            {ben.municipality}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Estado vacío cuando no hay coincidencias */
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                  <AlertCircle size={24} color="#8A9E9B" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A524E' }}>
                    No se encontraron coincidencias para "{query}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6E8581', marginTop: '0.25rem' }}>
                    Verifica si el nombre o documento está bien escrito o registra a la persona primero en el Módulo 1.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <span className="form-helper" style={{ color: '#DC2626', fontSize: '0.8rem' }}>{error}</span>}
      {!error && helperText && <span className="form-helper" style={{ fontSize: '0.78rem', color: '#6A8480' }}>{helperText}</span>}
    </div>
  );
}
