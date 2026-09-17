import React from 'react';
import {
  Users,
  MapPin,
  FolderGit2,
  Package,
  CalendarClock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HeartHandshake
} from 'lucide-react';

export function AggregatedDashboardView({ reports }) {
  if (!reports) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando indicadores agregados...</div>;
  }

  const {
    totalBeneficiaries,
    totalFamilyMembers,
    totalPeopleReached,
    municipalityCounts,
    populationGroups,
    withDisabilityCount,
    disabilityPercentage,
    undocumentedCount,
    totalEnrollments,
    linesBreakdown,
    totalAttentions,
    attentionCategories,
    totalFollowUps,
    trafficLightStats
  } = reports;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Garantía de Confidencialidad y Cumplimiento Normativo */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#E8F7F1',
          border: '1px solid #C7EEDD',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#0E6D63',
          fontSize: '0.85rem'
        }}
      >
        <ShieldCheck size={20} color="#167C55" style={{ flexShrink: 0 }} />
        <span>
          <strong>Garantía de Confidencialidad Humanitaria:</strong> Todos los indicadores mostrados a continuación son calculados en tiempo real de forma disociada, protegiendo la identidad y los datos personales (PII) de las familias según la Ley de Habeas Data y estándares de COOPI, FADV, HIAS y HI.
        </span>
      </div>

      {/* Grid de 2 Columnas para Desglose Territorial y Poblacional */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Panel 1: Distribución por Territorio / Municipio */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#094D46" /> Cobertura Territorial en Urabá
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 600 }}>
              {totalBeneficiaries} titulares
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(municipalityCounts).map(([mun, count]) => {
              const pct = totalBeneficiaries > 0 ? Math.round((count / totalBeneficiaries) * 100) : 0;
              let barColor = '#1D6FBA';
              if (mun === 'Turbo') barColor = '#0B7E7F';
              if (mun === 'Necoclí') barColor = '#167C55';

              return (
                <div key={mun}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#142724' }}>{mun}</span>
                    <span style={{ color: '#5A736F', fontWeight: 600 }}>
                      {count} personas ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F0F4F3', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #EAF0EE', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6A8480' }}>
            <span>Población sin documento formal: <strong>{undocumentedCount}</strong></span>
            <span>Total núcleo familiar: <strong>+{totalFamilyMembers}</strong></span>
          </div>
        </div>

        {/* Panel 2: Enfoque Diferencial y Grupos Poblacionales */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#094D46" /> Caracterización de Población
            </h4>
            <span
              style={{
                backgroundColor: '#E4F5F1',
                color: '#0E6D63',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '20px'
              }}
            >
              {disabilityPercentage}% con discapacidad
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(populationGroups).map(([group, count]) => {
              const pct = totalBeneficiaries > 0 ? Math.round((count / totalBeneficiaries) * 100) : 0;
              return (
                <div
                  key={group}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#F8FAF9',
                    borderRadius: '8px',
                    border: '1px solid #EAF0EE'
                  }}
                >
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#142724' }}>
                    {group}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#094D46' }}>
                      {count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#7E9692' }}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF7EA', color: '#966708', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Priorización de Discapacidad Activa ({withDisabilityCount} casos)
            </span>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas para Módulo 2 (Líneas) y Módulo 3 (Atenciones & Semáforo) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Panel 3: Avance por Líneas de Intervención (Módulo 2) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderGit2 size={18} color="#094D46" /> Participación por Línea de Acción
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 600 }}>
              {totalEnrollments} vinculaciones activas
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(linesBreakdown).map(([lineKey, line]) => {
              return (
                <div
                  key={lineKey}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: line.bg,
                    borderRadius: '10px',
                    border: `1px solid ${line.color}30`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#142724' }}>
                      {line.label}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: line.color }}>
                      {line.count} vinculados
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#5A736F' }}>
                    Meta plurianual estimada del proyecto: ~{line.target.toLocaleString('es-CO')} personas
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 4: Semáforo y Atenciones Humanitarias (Módulo 3) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2EAE7',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(9, 77, 70, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={18} color="#094D46" /> Estado Consolidado del Semáforo
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 600 }}>
              {totalFollowUps} seguimientos
            </span>
          </div>

          {/* Tarjetas Semáforo en mini-grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                backgroundColor: trafficLightStats.urgentCount > 0 ? '#FEF2F2' : '#F8FAF9',
                border: trafficLightStats.urgentCount > 0 ? '1.5px solid #EF4444' : '1px solid #E2EAE7',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: trafficLightStats.urgentCount > 0 ? '#DC2626' : '#142724' }}>
                {trafficLightStats.urgentCount}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: trafficLightStats.urgentCount > 0 ? '#991B1B' : '#6A8480', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                Vencidos / Alerta
              </div>
            </div>

            <div
              style={{
                backgroundColor: trafficLightStats.upcomingCount > 0 ? '#FEF7EA' : '#F8FAF9',
                border: trafficLightStats.upcomingCount > 0 ? '1.5px solid #F59E0B' : '1px solid #E2EAE7',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706' }}>
                {trafficLightStats.upcomingCount}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#966708', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                Próximos 7 días
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#E8F7F1',
                border: '1px solid #C7EEDD',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#167C55' }}>
                {trafficLightStats.onTrackCount}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#178358', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Al día / Programado
              </div>
            </div>
          </div>

          {/* Desglose de Ayudas Entregadas */}
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#142724', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Package size={15} color="#094D46" /> Entregas por Tipo de Ayuda ({totalAttentions} totales)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {Object.entries(attentionCategories).map(([categoryName, count]) => {
              if (count === 0) return null;
              return (
                <div
                  key={categoryName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.5rem',
                    backgroundColor: '#F9FBFA',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ color: '#2B423E' }}>{categoryName}</span>
                  <span style={{ fontWeight: 700, color: '#094D46' }}>{count} entregas</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
