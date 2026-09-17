import React from 'react';
import { Search, Plus } from 'lucide-react';
import { MUNICIPALITIES, DOCUMENT_TYPES } from '../../../core/constants';

export function BeneficiarySearch({
  searchQuery,
  onSearchChange,
  municipalityFilter,
  onMunicipalityChange,
  documentTypeFilter,
  onDocumentTypeChange,
  onCreateNew,
  onResetData,
  totalResults
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        backgroundColor: '#FFFFFF',
        padding: '0.875rem 1.25rem',
        borderRadius: '14px',
        border: '1px solid #E2EAE7',
        boxShadow: '0 1px 4px rgba(9, 77, 70, 0.03)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
        {/* Buscador predictivo en tiempo real con icono exacto */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8CA29E'
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, documento, código..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              borderRadius: '8px',
              border: '1px solid #D2DFDC',
              fontSize: '0.875rem',
              height: '42px'
            }}
          />
        </div>

        {/* Filtro por municipio de Urabá */}
        <div style={{ minWidth: '175px' }}>
          <select
            className="form-control"
            value={municipalityFilter}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            style={{
              borderRadius: '8px',
              border: '1px solid #D2DFDC',
              fontSize: '0.875rem',
              height: '42px',
              backgroundColor: '#FFFFFF',
              color: '#142724'
            }}
          >
            <option value="">Todos los municipios</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tipo de documento */}
        <div style={{ minWidth: '210px' }}>
          <select
            className="form-control"
            value={documentTypeFilter}
            onChange={(e) => onDocumentTypeChange(e.target.value)}
            style={{
              borderRadius: '8px',
              border: '1px solid #D2DFDC',
              fontSize: '0.875rem',
              height: '42px',
              backgroundColor: '#FFFFFF',
              color: '#142724'
            }}
          >
            <option value="">Todos los tipos de documento</option>
            {DOCUMENT_TYPES.map((doc) => (
              <option key={doc.value} value={doc.value}>
                {doc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón de nuevo registro */}
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>

        <button
          type="button"
          onClick={onCreateNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0 1.25rem',
            height: '42px',
            backgroundColor: '#094D46',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(9, 77, 70, 0.18)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#073F39'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#094D46'}
        >
          <Plus size={17} strokeWidth={2.5} />
          Nuevo Beneficiario
        </button>
      </div>
    </div>
  );
}
