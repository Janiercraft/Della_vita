import React from 'react';
import { ProgramStatusBadge } from './ProgramStatusBadge';
import { Edit3, Calendar } from 'lucide-react';

export function ProgramsTable({
  enrollments = [],
  onOpenStatusModal,
  onOpenEnrollModal,
  onNavigateToBeneficiary
}) {
  // Paginación a 10 registros por página solicitada por el usuario
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reiniciar a la página 1 cuando cambia el total de registros por filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [enrollments.length]);

  const totalPages = Math.max(1, Math.ceil(enrollments.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnrollments = enrollments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'BU').toUpperCase();
  };

  const getMunicipalityStyle = (mun = '') => {
    switch ((mun || '').toLowerCase()) {
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

  if (enrollments.length === 0) {
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
          No se encontraron vinculaciones a programas con los criterios seleccionados.
        </div>
        <button
          type="button"
          onClick={onOpenEnrollModal}
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
          Vincular Beneficiario a un Programa
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Vista de Escritorio */}
      <div className="table-responsive desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>BENEFICIARIO</th>
              <th>PROGRAMA</th>
              <th>LÍNEA DE ACCIÓN</th>
              <th>MUNICIPIO</th>
              <th>FECHA INGRESO</th>
              <th>ESTADO</th>
              <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnrollments.map((enr) => {
              const initials = getInitials(enr.beneficiaryName);
              const munStyle = getMunicipalityStyle(enr.beneficiaryMunicipality);

              return (
                <tr key={enr.id}>
                  {/* Beneficiario: Solo avatar y nombre con redirección directa al Módulo 1 */}
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <div
                      onClick={() => onNavigateToBeneficiary && onNavigateToBeneficiary(enr.beneficiaryId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        cursor: 'pointer',
                        padding: '0.35rem 0.65rem',
                        marginLeft: '-0.65rem',
                        borderRadius: '8px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EBF4F2';
                        const text = e.currentTarget.querySelector('.beneficiary-name');
                        if (text) {
                          text.style.color = '#094D46';
                          text.style.textDecoration = 'underline';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const text = e.currentTarget.querySelector('.beneficiary-name');
                        if (text) {
                          text.style.color = '#142724';
                          text.style.textDecoration = 'none';
                        }
                      }}
                      title="Clic para ver la información y expediente completo del beneficiario en el Módulo 1"
                    >
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
                      <div
                        className="beneficiary-name"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: '#142724',
                          lineHeight: 1.25,
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {enr.beneficiaryName}
                      </div>
                    </div>
                  </td>

                  {/* Programa */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#142724', fontSize: '0.9rem' }}>
                      {enr.programName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7E9692', marginTop: '2px' }}>
                      Código: <strong>{enr.programCode}</strong>
                    </div>
                  </td>

                  {/* Línea de Acción */}
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#E6F4F2',
                        color: '#094D46',
                        border: '1px solid #B7DFD9',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        maxWidth: '220px',
                        whiteSpace: 'normal',
                        lineHeight: 1.3
                      }}
                    >
                      {enr.lineName}
                    </span>
                  </td>

                  {/* Municipio */}
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
                      {enr.beneficiaryMunicipality || 'Apartadó'}
                    </span>
                  </td>

                  {/* Fecha de Vinculación */}
                  <td>
                    <span style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#142724', fontWeight: 500 }}>
                      <Calendar size={13} color="#094D46" />
                      {enr.enrollmentDate}
                    </span>
                  </td>

                  {/* Estado de Participación */}
                  <td>
                    <ProgramStatusBadge status={enr.status} />
                  </td>

                  {/* Acciones */}
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onOpenStatusModal(enr)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D5E1DE',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#142724',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0F5F4';
                        e.currentTarget.style.color = '#094D46';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#142724';
                      }}
                    >
                      <Edit3 size={13} />
                      Cambiar Estado
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil */}
      <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
        {paginatedEnrollments.map((enr) => {
          const initials = getInitials(enr.beneficiaryName);
          const munStyle = getMunicipalityStyle(enr.beneficiaryMunicipality);

          return (
            <div
              key={enr.id}
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
                  {enr.programCode}
                </span>
                <ProgramStatusBadge status={enr.status} />
              </div>

              <div
                onClick={() => onNavigateToBeneficiary && onNavigateToBeneficiary(enr.beneficiaryId)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.625rem 0', cursor: 'pointer' }}
                title="Clic para ver la información en el Módulo 1"
              >
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
                    {enr.beneficiaryName}
                  </h4>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#094D46' }}>
                    {enr.programName}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid #EAF0EE', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#6A8480' }}>
                  {enr.enrollmentDate}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(enr)}
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
                  Cambiar Estado
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie de Tabla con Control de Vinculaciones y Paginador Dinámico (10 por página) */}
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
            {enrollments.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, enrollments.length)}
          </strong>{' '}
          de <strong style={{ color: '#094D46' }}>{enrollments.length}</strong> vinculaciones (10 por página)
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
    </>
  );
}
