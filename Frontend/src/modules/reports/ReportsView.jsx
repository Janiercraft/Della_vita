import React, { useState } from 'react';
import { useReports } from './hooks/useReports';
import { AggregatedDashboardView } from './components/AggregatedDashboardView';
import { Profile360View } from './components/Profile360View';
import { Toast } from '../../shared/components/Modal';
import { apiAdapter } from '../../core/adapters/apiAdapter';
import { useAuth } from '../../core/auth/AuthContext';
import {
  BarChart3,
  FileText,
  Users,
  FolderGit2,
  Package,
  ShieldCheck,
  Search,
  ArrowRight,
  Upload,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function ReportsView() {
  const {
    activeSubTab,
    setActiveSubTab,
    beneficiariesList,
    reportsData,
    profile360,
    feedbackMessage,
    setFeedbackMessage,
    handleSelectBeneficiary,
    handleResetAllData,
    refreshData
  } = useReports();

  const { role } = useAuth();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lastImport, setLastImport] = useState(null);

  const handleExcelUpload = async (event) => {
    const input = event.target;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const extension = archivo.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension)) {
      setFeedbackMessage({
        type: 'error',
        text: 'Formato no permitido. Selecciona un archivo XLSX, XLS o CSV.'
      });
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      setFeedbackMessage({
        type: 'error',
        text: 'El archivo supera el máximo permitido de 10 MB.'
      });
      input.value = '';
      return;
    }

    setUploadingFile(true);
    setLastImport(null);
    try {
      const resultado = await apiAdapter.importarArchivoAutomatico(archivo, {
        confirmar: true,
        hoja: 0,
        separador: 'AUTO'
      });

      setLastImport(resultado);
      const resultados = resultado?.resultados || {};
      const importados = Number(resultados.IMPORTADO || 0);
      const duplicados = Number(resultados.DUPLICADO || 0);
      const pendientes = Number(resultados.PENDIENTE || 0);
      const errores = Number(resultados.ERROR || 0);

      setFeedbackMessage({
        type: errores > 0 || pendientes > 0 ? 'warning' : 'success',
        text: `Importación #${resultado?.id ?? '-'} procesada: ${importados} importados, ${duplicados} duplicados, ${pendientes} pendientes y ${errores} errores.`
      });

      await refreshData();
    } catch (error) {
      setFeedbackMessage({
        type: 'error',
        text: error.message || 'No fue posible cargar el archivo al servidor.'
      });
    } finally {
      setUploadingFile(false);
      input.value = '';
    }
  };

  return (
    <div>
      {/* Encabezado del Módulo */}
      <div className="no-print" style={{ marginBottom: '1.25rem' }}>
        <h1
          style={{
            fontSize: '1.95rem',
            fontWeight: 800,
            color: '#142724',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          Consultas, Ficha Consolidada 360° y Reportes
        </h1>

        <p
          style={{
            color: '#5C7470',
            fontSize: '0.92rem',
            maxWidth: '920px',
            marginTop: '0.35rem',
            lineHeight: 1.5
          }}
        >
          Visualiza indicadores agregados del proyecto sin datos sensibles (PII) o consulta la ficha integral 360° de cada persona con su historial y opción de impresión.
        </p>
      </div>

      {/* Selector de Pestañas Principal del Módulo (Ubicado de forma destacada al inicio) */}
      <div
        className="no-print"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #D9E4E1',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 6px rgba(9, 77, 70, 0.04)'
        }}
      >
        {/* Pestañas de Navegación del Módulo 4: Paso 6 y Paso 7 */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Pestaña: Paso 6 - Ficha Consolidada 360° */}
          <button
            type="button"
            onClick={() => setActiveSubTab('profile360')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: activeSubTab === 'profile360' ? '1px solid #094D46' : '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'profile360' ? '#094D46' : '#F4F7F6',
              color: activeSubTab === 'profile360' ? '#FFFFFF' : '#39524E',
              boxShadow: activeSubTab === 'profile360' ? '0 2px 6px rgba(9, 77, 70, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Search size={17} />
            <span>Paso 6: Ficha Consolidada 360°</span>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: activeSubTab === 'profile360' ? 'rgba(255,255,255,0.2)' : '#D6EFE7',
                color: activeSubTab === 'profile360' ? '#FFFFFF' : '#0B6C5F',
                padding: '0.15rem 0.45rem',
                borderRadius: '12px',
                fontWeight: 700
              }}
            >
              Historial e Impresión
            </span>
          </button>

          {/* Pestaña: Paso 7 - Dashboard de Reportes Agregados */}
          <button
            type="button"
            onClick={() => setActiveSubTab('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: activeSubTab === 'dashboard' ? '1px solid #094D46' : '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'dashboard' ? '#094D46' : '#F4F7F6',
              color: activeSubTab === 'dashboard' ? '#FFFFFF' : '#39524E',
              boxShadow: activeSubTab === 'dashboard' ? '0 2px 6px rgba(9, 77, 70, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={17} />
            <span>Paso 7: Indicadores y Reportes</span>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: activeSubTab === 'dashboard' ? 'rgba(255,255,255,0.2)' : '#E2EAE7',
                padding: '0.15rem 0.45rem',
                borderRadius: '12px'
              }}
            >
              Sin PII
            </span>
          </button>
        </div>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      {activeSubTab === 'dashboard' ? (
        <div>
          {/* Banner de acceso rápido a la Ficha 360° */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#EFF9F6',
                  border: '1px solid #B8E4D5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#D1EFE5',
                  color: '#0E6D63',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Search size={16} />
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1B4740' }}>
                <strong>¿Deseas ver el expediente individual de una persona?</strong> Accede al buscador unificado y a la ficha imprimible.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('profile360')}
              style={{
                backgroundColor: '#094D46',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Ir a Ficha 360° e Imprimir</span>
              <ArrowRight size={14} />
            </button>
          </div>
            
          {/* Carga masiva conectada al backend: solo ADMIN puede importar */}
          {role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#F4F7F6',
                  border: '1px dashed #B8E4D5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#E8F7F1',
                      color: '#178358',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {uploadingFile ? <LoaderCircle size={16} className="spin" /> : <Upload size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: '#1B4740' }}>
                      <strong>Carga de datos masivos</strong> Sube Excel o CSV y el backend detectará automáticamente las columnas.
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#6A817D', marginTop: '0.2rem' }}>
                      Formatos: .xlsx, .xls, .csv · Máximo 10 MB · Primera hoja · Confirmación automática
                    </div>
                  </div>
                </div>

                <label
                  aria-disabled={uploadingFile}
                  style={{
                    backgroundColor: uploadingFile ? '#87A69E' : '#178358',
                    color: '#FFFFFF',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: uploadingFile ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {uploadingFile ? (
                    <>
                      <LoaderCircle size={15} className="spin" />
                      <span>Procesando archivo...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Subir Archivo Excel / CSV</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    disabled={uploadingFile}
                    style={{ display: 'none' }}
                    onChange={handleExcelUpload}
                  />
                </label>
              </div>

              {lastImport && (
                <div
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    border: `1px solid ${Number(lastImport.resultados?.ERROR || 0) > 0 ? '#F3C5C5' : '#B8E4D5'}`,
                    backgroundColor: Number(lastImport.resultados?.ERROR || 0) > 0 ? '#FFF7F7' : '#F4FBF8',
                    color: '#1B4740',
                    display: 'flex',
                    gap: '0.65rem',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap'
                  }}
                >
                  {Number(lastImport.resultados?.ERROR || 0) > 0
                    ? <AlertTriangle size={18} color="#B54747" />
                    : <CheckCircle2 size={18} color="#178358" />}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>
                      Importación #{lastImport.id} · {lastImport.estado}
                    </div>
                    <div style={{ fontSize: '0.77rem', color: '#5C7470', marginTop: '0.25rem' }}>
                      Archivo: {lastImport.nombreArchivo} · Total de filas: {lastImport.total || 0}
                    </div>
                    <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginTop: '0.45rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span>Importados: {lastImport.resultados?.IMPORTADO || 0}</span>
                      <span>Duplicados: {lastImport.resultados?.DUPLICADO || 0}</span>
                      <span>Pendientes: {lastImport.resultados?.PENDIENTE || 0}</span>
                      <span>Errores: {lastImport.resultados?.ERROR || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* 4 Tarjetas de Métricas Globales del Sistema */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.125rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Card 1: TOTAL PERSONAS ALCANZADAS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid #E2EAE7',
                boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  POBLACIÓN ALCANZADA
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#094D46', lineHeight: 1.15, marginTop: '0.35rem' }}>
                  {reportsData?.totalPeopleReached || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#178358', fontWeight: 600, marginTop: '0.35rem' }}>
                  Titulares + Núcleos Familiares
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E8F7F1',
                  color: '#178358',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={22} />
              </div>
            </div>

            {/* Card 2: TITULARES REGISTRADOS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid #E2EAE7',
                boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BENEFICIARIOS ÚNICOS
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
                  {reportsData?.totalBeneficiaries || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1D6FBA', fontWeight: 600, marginTop: '0.35rem' }}>
                  Con código único UP-2026
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EBF3FC',
                  color: '#1D6FBA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={22} />
              </div>
            </div>

            {/* Card 3: VINCULACIONES A PROGRAMAS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid #E2EAE7',
                boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  VINCULACIONES ACTIVAS
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
                  {reportsData?.totalEnrollments || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0B7E7F', fontWeight: 600, marginTop: '0.35rem' }}>
                  En 3 líneas de acción
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E5F6F6',
                  color: '#0B7E7F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FolderGit2 size={22} />
              </div>
            </div>

            {/* Card 4: ATENCIONES Y AYUDAS ENTREGADAS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid #E2EAE7',
                boxShadow: '0 1px 3px rgba(9, 77, 70, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E9692', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AYUDAS ENTREGADAS
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#142724', lineHeight: 1.15, marginTop: '0.35rem' }}>
                  {reportsData?.totalAttentions || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#966708', fontWeight: 600, marginTop: '0.35rem' }}>
                  Kits, salud y capital semilla
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF7EA',
                  color: '#966708',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Package size={22} />
              </div>
            </div>
          </div>

          {/* Gráficos y desglose sin PII */}
          <AggregatedDashboardView reports={reportsData} />
        </div>
      ) : (
        /* Pestaña 2: Ficha Consolidada 360° con Buscador Autocomplete y Botón de Impresión al Inicio */
        <div>
          <Profile360View
            profile={profile360}
            beneficiariesList={beneficiariesList}
            onSelectBeneficiary={handleSelectBeneficiary}
          />
        </div>
      )}

      {/* Notificación Toast */}
      <Toast
        message={feedbackMessage}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
