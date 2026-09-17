import React from 'react';
import { Eye, Edit3, User, Check } from 'lucide-react';

export function BeneficiaryTable({
  beneficiaries = [],
  onView,
  onEdit,
  onCreateNew
}) {
  // Paginación a 10 registros por página solicitada por el usuario
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reiniciar a la página 1 cuando cambia el filtro o la cantidad
  React.useEffect(() => {
    setCurrentPage(1);
  }, [beneficiaries.length]);

  const totalPages = Math.max(1, Math.ceil(beneficiaries.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBeneficiaries = beneficiaries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Función para obtener iniciales del beneficiario (ej. "Paola Anaya" -> "PA")
  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'BU').toUpperCase();
  };

  const getMunicipalityStyle = (mun = '') => {
    switch (mun.toLowerCase()) {
      case 'apartadó':
      case 'apartado':
        return { backgroundColor: '#EBF3FC', color: '#1D6FBA', border: '1px solid #CFE3F9' };
      case 'turbo':
        return { backgroundColor: '#E5F6F6', color: '#0B7E7F', border: '1px solid #BCEAEA' };
      case 'necoclí':
      case 'necocli':
        return { backgroundColor: '#EAF5F2', color: '#167C55', border: '1px solid #C7EEDD' };
      default:
        return { backgroundColor: '#F0F4F3', color: '#39524E', border: '1px solid #DDE5E3' };
    }
  };

  if (beneficiaries.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px dashed #D2DFDC'
        }}
      >
        <div style={{ color: '#647B77', marginBottom: '1rem', fontSize: '0.95rem' }}>
          No se encontraron beneficiarios con los criterios de búsqueda actuales.
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          style={{
            padding: '0.55rem 1.25rem',
            backgroundColor: '#094D46',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Registrar como Nuevo Beneficiario
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2EAE7',
        boxShadow: '0 1px 4px rgba(9, 77, 70, 0.03)',
        overflow: 'hidden'
      }}
    >
      {/* Cabecera de la tabla idéntica al diseño */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #EAF0EE'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#142724' }}>
            Registros Activos en Urabá
          </h3>
          <span
            style={{
              backgroundColor: '#E4F5F1',
              color: '#0E6D63',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: '20px'
            }}
          >
            {beneficiaries.length} registrados
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#829994', fontWeight: 500 }}>
          Mostrando página 1 de 1
        </div>
      </div>

      {/* Vista de Escritorio */}
      <div className="table-responsive desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>CÓDIGO INTERNO</th>
              <th>BENEFICIARIO</th>
              <th>DOCUMENTO</th>
              <th>MUNICIPIO</th>
              <th>FAMILIA</th>
              <th>CONSENTIMIENTO</th>
              <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBeneficiaries.map((b) => {
              const familyCount = (b.familyMembers || []).length;
              const munStyle = getMunicipalityStyle(b.municipality);
              const initials = getInitials(b.fullName);

              return (
                <tr key={b.id}>
                  {/* Código Interno con estilo badge suave */}
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <span
                      style={{
                        backgroundColor: '#F0F4F3',
                        border: '1px solid #DCE5E3',
                        color: '#2E4945',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {b.internalCode}
                    </span>
                  </td>

                  {/* Beneficiario con avatar circular verde/teal */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: '#1CA89D',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#142724', lineHeight: 1.25 }}>
                          {b.fullName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6C8681', marginTop: '2px' }}>
                          {b.populationGroup || 'Comunidad Local'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Documento */}
                  <td>
                    {b.documentType === 'SD' ? (
                      <span style={{ fontSize: '0.82rem', color: '#0E8388', fontStyle: 'italic' }}>
                        Sin doc. / En trámite
                      </span>
                    ) : (
                      <div style={{ fontSize: '0.875rem' }}>
                        <span style={{ color: '#7E9692', fontSize: '0.8rem' }}>{b.documentType}:</span>{' '}
                        <strong style={{ color: '#142724', fontWeight: 700 }}>{b.documentNumber}</strong>
                      </div>
                    )}
                  </td>

                  {/* Municipio en pill suave con color por municipio */}
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        ...munStyle
                      }}
                    >
                      {b.municipality}
                    </span>
                  </td>

                  {/* Familia */}
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: '#556E6A' }}>
                      <User size={14} color="#7A948F" />
                      {familyCount} {familyCount === 1 ? 'familiar' : 'familiares'}
                    </span>
                  </td>

                  {/* Consentimiento Habeas Data */}
                  <td>
                    {b.dataProcessingConsent ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: '#E8F7F1',
                          color: '#167C55',
                          border: '1px solid #C4EEDC',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        <Check size={13} strokeWidth={2.5} /> Autorizado
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pendiente</span>
                    )}
                  </td>

                  {/* Acciones: Botón de vista y edición en iconos sobrios */}
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onView(b)}
                        title="Ver ficha completa"
                        style={{
                          background: 'none',
                          border: '1px solid #D5E1DE',
                          color: '#55706C',
                          cursor: 'pointer',
                          padding: '0.4rem 0.55rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0F5F4';
                          e.currentTarget.style.color = '#094D46';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#55706C';
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(b)}
                        title="Editar información"
                        style={{
                          background: 'none',
                          border: '1px solid #D5E1DE',
                          color: '#55706C',
                          cursor: 'pointer',
                          padding: '0.4rem 0.55rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0F5F4';
                          e.currentTarget.style.color = '#094D46';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#55706C';
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil: Tarjetas Táctiles */}
      <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
        {paginatedBeneficiaries.map((b) => {
          const familyCount = (b.familyMembers || []).length;
          const munStyle = getMunicipalityStyle(b.municipality);
          const initials = getInitials(b.fullName);

          return (
            <div
              key={b.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2EAE7',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: '#F0F4F3',
                    border: '1px solid #DCE5E3',
                    color: '#2E4945',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  {b.internalCode}
                </span>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    ...munStyle
                  }}
                >
                  {b.municipality}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.625rem 0' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1CA89D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142724' }}>
                    {b.fullName}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#6C8681' }}>
                    {b.documentType === 'SD' ? 'Sin documento / En trámite' : `${b.documentType}: ${b.documentNumber}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid #EAF0EE', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#556E6A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={13} /> {familyCount} {familyCount === 1 ? 'familiar' : 'familiares'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onView(b)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #D2DFDC',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#142724',
                      cursor: 'pointer'
                    }}
                  >
                    Ficha
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(b)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #D2DFDC',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#142724',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie de Tabla con Control Preventivo y Paginador Dinámico (10 por página) */}
      <div
        style={{
          padding: '1.1rem 1.5rem',
          borderTop: '1px solid #EAF0EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ fontSize: '0.825rem', color: '#6A8480' }}>
          Mostrando{' '}
          <strong style={{ color: '#142724' }}>
            {beneficiaries.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, beneficiaries.length)}
          </strong>{' '}
          de <strong style={{ color: '#094D46' }}>{beneficiaries.length}</strong> beneficiarios (10 por página)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D5E1DE',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: validCurrentPage <= 1 ? '#9EAEA9' : '#142724',
              cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: pageNum === validCurrentPage ? '#094D46' : '#FFFFFF',
                color: pageNum === validCurrentPage ? '#FFFFFF' : '#142724',
                border: pageNum === validCurrentPage ? 'none' : '1px solid #D5E1DE',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D5E1DE',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: validCurrentPage >= totalPages ? '#9EAEA9' : '#142724',
              cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Siguiente
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
