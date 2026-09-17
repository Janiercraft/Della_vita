import React, { useState, useRef, useEffect, useMemo } from 'react';
import { textMatches } from '../../../core/utils/textUtils';
import { TrafficLightBadge } from '../../attentions/components/TrafficLightBadge';
import { ProgramStatusBadge } from '../../programs/components/ProgramStatusBadge';
import { AttentionTypeBadge } from '../../attentions/components/AttentionTypeBadge';
import {
  Printer,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Users,
  FolderGit2,
  Package,
  CalendarClock,
  AlertCircle,
  Search,
  X,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Shield,
  FileText,
  Clock
} from 'lucide-react';

export function Profile360View({
  profile,
  beneficiariesList = [],
  onSelectBeneficiary
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
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

  const handlePrint = () => {
    window.print();
  };

  // Filtrado reactivo en tiempo real
  const filteredBeneficiaries = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return beneficiariesList;
    return beneficiariesList.filter(b => {
      return (
        textMatches(b.fullName, q) ||
        textMatches(b.internalCode, q) ||
        textMatches(b.documentNumber || '', q) ||
        textMatches(b.municipality || '', q)
      );
    });
  }, [beneficiariesList, searchQuery]);

  const handlePickBeneficiary = (ben) => {
    onSelectBeneficiary(ben.id);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onSelectBeneficiary('');
    setSearchQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const beneficiary = profile?.beneficiary || null;
  const familyMembers = profile?.familyMembers || [];
  const linkedPrograms = profile?.linkedPrograms || [];
  const attentions = profile?.attentions || [];
  const followups = profile?.followups || [];
  const initials = beneficiary ? getInitials(beneficiary.fullName) : '';

  const childrenList = useMemo(() => {
    return familyMembers.filter(m => {
      const k = (m.kinship || m.relationship || '').toLowerCase();
      return k.includes('hijo') || k.includes('hija');
    });
  }, [familyMembers]);

  const avatarColors = ['#1CA89D', '#0D5C53', '#1D6FBA', '#7C3AED', '#D97706'];
  const avatarBg = beneficiary
    ? avatarColors[beneficiary.fullName.charCodeAt(0) % avatarColors.length]
    : '#1CA89D';

  const InfoCell = ({ icon: Icon, label, value, sub, subColor, subBold }) => (
    <div className="p360-info-cell">
      <div className="p360-info-label"><Icon size={10} /> {label}</div>
      <div className="p360-info-value">{value}</div>
      {sub && <div className="p360-info-sub" style={{ color: subColor, fontWeight: subBold ? 700 : undefined }}>{sub}</div>}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, count, right }) => (
    <div className="p360-section-header">
      <Icon size={14} color="#094D46" />
      <h3 className="p360-section-title">{title}</h3>
      <span className="p360-section-count">{count}</span>
      {right && <span style={{ marginLeft: 'auto' }}>{right}</span>}
    </div>
  );

  return (
    <>
      <style>{`
        .p360-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
        .p360-table thead tr { background: #F3F6F5; }
        .p360-table thead th { padding: .5rem .85rem; text-align: left; font-size: .68rem; font-weight: 800; color: #4B5563; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1.5px solid #E2EAE7; }
        .p360-table tbody tr { border-bottom: 1px solid #F0F4F3; transition: background .12s; }
        .p360-table tbody tr:last-child { border-bottom: none; }
        .p360-table tbody tr:hover { background: #F8FAF9; }
        .p360-table tbody td { padding: .6rem .85rem; vertical-align: top; color: #374151; }
        .p360-section { margin-bottom: 1.5rem; }
        .p360-section-header { display: flex; align-items: center; gap: .45rem; padding-bottom: .5rem; border-bottom: 1.5px solid #E2EAE7; margin-bottom: .8rem; }
        .p360-section-title { font-size: .9rem; font-weight: 800; color: #142724; margin: 0; }
        .p360-section-count { font-size: .7rem; font-weight: 700; background: #E4F5F1; color: #094D46; padding: .12rem .45rem; border-radius: 20px; }
        .p360-info-grid { display: grid; grid-template-columns: repeat(4,1fr); background: #F7FAF9; border-radius: 10px; border: 1px solid #E2EAE7; overflow: hidden; margin-bottom: 1.5rem; }
        .p360-info-cell { padding: .8rem 1rem; border-right: 1px solid #E2EAE7; }
        .p360-info-cell:last-child { border-right: none; }
        .p360-info-label { display: flex; align-items: center; gap: .3rem; font-size: .66rem; font-weight: 700; color: #7E9692; text-transform: uppercase; letter-spacing: .04em; margin-bottom: .28rem; }
        .p360-info-value { font-size: .85rem; font-weight: 700; color: #142724; line-height: 1.3; }
        .p360-info-sub { font-size: .74rem; color: #5C7470; margin-top: .18rem; }
        @media (max-width: 860px) {
          .p360-info-grid { grid-template-columns: 1fr 1fr; }
          .p360-info-cell { border-right: none; border-bottom: 1px solid #E2EAE7; }
          .p360-info-cell:nth-child(odd):not(:last-child) { border-right: 1px solid #E2EAE7; }
          .p360-info-cell:nth-last-child(-n+2) { border-bottom: none; }
        }
        @media (max-width: 520px) { .p360-info-grid { grid-template-columns: 1fr; } .p360-info-cell { border-right: none !important; } }
        @media print { .no-print { display: none !important; } .p360-print-header { display: block !important; } .p360-ficha-card { border: none !important; box-shadow: none !important; padding: 0 !important; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ══ BARRA DE BÚSQUEDA ══ */}
        <div className="no-print" style={{ backgroundColor: '#FFF', borderRadius: '13px', border: '1px solid #D9E4E1', padding: '1rem 1.2rem', boxShadow: '0 1px 4px rgba(9,77,70,.05)' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.8rem', fontSize: '.76rem', color: '#7E9692', fontWeight: 600 }}>
            <Shield size={12} color="#094D46" />
            <span style={{ color: '#094D46', fontWeight: 700 }}>URABÁ-PAÍS</span>
            <ChevronRight size={12} />
            <span>Consultas y Ficha 360°</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
            {/* Autocomplete */}
            <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAF9', border: isDropdownOpen ? '1.5px solid #094D46' : '1.5px solid #D9E4E1', borderRadius: '8px', padding: '.5rem .8rem', gap: '.5rem', transition: 'border-color .18s ease' }}>
                <Search size={15} color="#094D46" style={{ flexShrink: 0 }} />
                <input ref={inputRef} type="text" value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Buscar por nombre, cédula o código UP-2026…"
                  style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '.875rem', color: '#142724', fontWeight: 500 }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px', display: 'flex' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {isDropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: '#FFF', borderRadius: '10px', border: '1.5px solid #094D46', boxShadow: '0 8px 24px rgba(0,0,0,.12)', maxHeight: '260px', overflowY: 'auto', zIndex: 1000 }}>
                  {filteredBeneficiaries.length === 0 ? (
                    <div style={{ padding: '.9rem', textAlign: 'center', color: '#6A8480', fontSize: '.84rem' }}>
                      Sin resultados para "<strong>{searchQuery}</strong>"
                    </div>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <div key={b.id} onClick={() => handlePickBeneficiary(b)}
                        style={{ padding: '.6rem .9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #F0F4F3', backgroundColor: beneficiary?.id === b.id ? '#EFF9F6' : '#FFF', transition: 'background .12s' }}
                        onMouseEnter={(e) => { if (beneficiary?.id !== b.id) e.currentTarget.style.backgroundColor = '#F7FAF9'; }}
                        onMouseLeave={(e) => { if (beneficiary?.id !== b.id) e.currentTarget.style.backgroundColor = '#FFF'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E4F5F1', color: '#0E6D63', fontWeight: 700, fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getInitials(b.fullName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.84rem', color: '#142724' }}>{b.fullName}</div>
                            <div style={{ fontSize: '.72rem', color: '#66807B' }}>{b.documentType}: {b.documentNumber || 'En trámite'} • {b.municipality}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '.7rem', fontWeight: 700, backgroundColor: '#E2EAE7', color: '#0D5C54', padding: '.15rem .45rem', borderRadius: '5px', flexShrink: 0 }}>{b.internalCode}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
              {beneficiary && (
                <button type="button" onClick={handleClearSelection}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.48rem .85rem', borderRadius: '7px', fontSize: '.78rem', fontWeight: 600, border: '1.5px solid #D2DFDC', backgroundColor: '#F8FAF9', color: '#4B5563', cursor: 'pointer' }}>
                  <X size={12} /><span>Ver Directorio Completo</span>
                </button>
              )}
              <button type="button" onClick={handlePrint} disabled={!beneficiary}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.48rem .95rem', borderRadius: '7px', backgroundColor: beneficiary ? '#094D46' : '#E2EAE7', color: beneficiary ? '#FFF' : '#9CA3AF', border: 'none', fontWeight: 700, fontSize: '.8rem', cursor: beneficiary ? 'pointer' : 'not-allowed', boxShadow: beneficiary ? '0 2px 6px rgba(9,77,70,.2)' : 'none', transition: 'all .15s ease' }}>
                <Printer size={14} /><span>Exportar Ficha 360°</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══ DIRECTORIO ══ */}
        {!beneficiary ? (
          <div style={{ backgroundColor: '#FFF', borderRadius: '13px', border: '1px solid #E2EAE7', padding: '1.5rem', boxShadow: '0 1px 4px rgba(9,77,70,.04)' }}>
            <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 1.5rem auto' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#EFF9F6', color: '#094D46', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.6rem' }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#142724', marginBottom: '.3rem' }}>Directorio de Familias Registradas</h3>
              <p style={{ fontSize: '.84rem', color: '#5C7470', lineHeight: 1.55 }}>Usa el buscador o haz clic en cualquier persona para abrir su <strong>Ficha Consolidada 360°</strong>.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '.8rem' }}>
              {filteredBeneficiaries.map((b) => (
                <div key={b.id} onClick={() => handlePickBeneficiary(b)}
                  style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1.5px solid #E2EAE7', padding: '1rem', cursor: 'pointer', transition: 'all .18s ease', display: 'flex', flexDirection: 'column', gap: '.75rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#094D46'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 14px rgba(9,77,70,.09)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2EAE7'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.55rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1CA89D', color: '#FFF', fontWeight: 800, fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(b.fullName)}</div>
                      <span style={{ fontSize: '.68rem', fontWeight: 800, backgroundColor: '#E4F5F1', color: '#094D46', padding: '.13rem .48rem', borderRadius: '20px' }}>{b.internalCode}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '.94rem', color: '#142724', lineHeight: 1.3 }}>{b.fullName}</div>
                    <div style={{ fontSize: '.75rem', color: '#5C7470', marginTop: '.18rem' }}>{b.documentType}: {b.documentNumber || 'En trámite'}</div>
                    <div style={{ display: 'flex', gap: '.3rem', marginTop: '.55rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.68rem', backgroundColor: '#F0F5F4', color: '#39524E', padding: '.1rem .42rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MapPin size={9} />{b.municipality}</span>
                      <span style={{ fontSize: '.68rem', backgroundColor: '#F0F5F4', color: '#39524E', padding: '.1rem .42rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><Users size={9} />{b.familyMembers?.length || 0} familiares</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '.6rem', borderTop: '1px solid #F0F4F3', fontSize: '.76rem', fontWeight: 700, color: '#094D46' }}>
                    <span>Abrir Expediente 360°</span><ArrowRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (

          /* ══ FICHA 360° ══ */
          <div id="printable-dossier" className="p360-ficha-card"
            style={{ backgroundColor: '#FFF', borderRadius: '13px', border: '1px solid #E2EAE7', padding: '1.75rem', boxShadow: '0 1px 4px rgba(9,77,70,.04)' }}>

            {/* Cabecera PDF-only */}
            <div className="p360-print-header" style={{ display: 'none', borderBottom: '2.5px solid #063630', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13pt', fontWeight: 900, color: '#063630' }}>PROYECTO URABÁ-PAÍS — GESTIÓN HUMANITARIA</div>
                  <div style={{ fontSize: '8pt', color: '#4B5563', marginTop: '2px', fontWeight: 600 }}>Consorcio: COOPI • Fondazione L'Albero della Vita • HIAS • Humanity &amp; Inclusion</div>
                  <div style={{ fontSize: '9.5pt', fontWeight: 800, color: '#094D46', marginTop: '3px' }}>EXPEDIENTE OFICIAL CONSOLIDADO — FICHA INTEGRAL 360°</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '8pt', color: '#4B5563' }}>
                  <div><strong>Territorio:</strong> Apartadó • Turbo • Necoclí</div>
                  <div><strong>Emisión:</strong> {new Date().toLocaleDateString('es-CO')}</div>
                </div>
              </div>
            </div>

            {/* Cabecera del beneficiario */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '1.1rem', marginBottom: '1.2rem', borderBottom: '1.5px solid #E2EAE7', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: avatarBg, color: '#FFF', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px ' + avatarBg + '55' }}>
                  {initials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.28rem' }}>
                    <span style={{ backgroundColor: '#063630', color: '#FFF', fontSize: '.7rem', fontWeight: 800, padding: '.16rem .52rem', borderRadius: '5px', letterSpacing: '.03em' }}>{beneficiary.internalCode}</span>
                    {beneficiary.habeasDataAuthorized && (
                      <span style={{ backgroundColor: '#E8F7F1', color: '#178358', fontSize: '.68rem', fontWeight: 700, padding: '.16rem .48rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '.22rem' }}>
                        <ShieldCheck size={10} />Habeas Data
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#142724', margin: '0 0 .18rem 0', lineHeight: 1.2 }}>{beneficiary.fullName}</h2>
                  <div style={{ fontSize: '.78rem', color: '#6B7280' }}>
                    {beneficiary.documentType}: <strong style={{ color: '#374151' }}>{beneficiary.documentNumber || 'En trámite'}</strong>
                    {' • '}Nacimiento: {beneficiary.birthDate || 'No registrada'}
                    {' • '}{beneficiary.gender || 'No especificado'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.32rem', backgroundColor: '#EBF3FC', color: '#1D6FBA', fontSize: '.73rem', fontWeight: 700, padding: '.26rem .7rem', borderRadius: '20px', marginBottom: '.35rem' }}>
                  <Shield size={12} />{beneficiary.populationGroup || 'Víctima del Conflicto Armado'}
                </div>
                <div style={{ fontSize: '.7rem', color: '#7E9692', display: 'flex', alignItems: 'center', gap: '.28rem', justifyContent: 'flex-end' }}>
                  <Clock size={10} />Registrado: {beneficiary.registrationDate || '2026-02-10'}
                </div>
              </div>
            </div>

            {/* Grid 4 datos */}
            <div className="p360-info-grid">
              <InfoCell icon={MapPin} label="TERRITORIO Y DIRECCIÓN"
                value={beneficiary.municipality + ' (' + (beneficiary.communityZone || beneficiary.community || 'Área Urbana') + ')'}
                sub={beneficiary.address || 'Sin dirección específica'} />
              <InfoCell icon={Phone} label="TELÉFONO DE CONTACTO"
                value={beneficiary.phone || 'Sin teléfono registrado'}
                sub="Estado: Activo para seguimiento" />
              <InfoCell icon={User} label="ENFOQUE DIFERENCIAL Y ÉTNICO"
                value={(beneficiary.ethnicity && beneficiary.ethnicity !== 'Ninguna / No aplica') ? beneficiary.ethnicity : 'Comunidad Local'}
                sub={beneficiary.hasDisability ? 'Con condición de discapacidad' : 'Sin discapacidad'} />
              <InfoCell icon={Users} label="JEFATURA Y COMPOSICIÓN"
                value={beneficiary.isHeadOfHousehold ? 'Jefa / Jefe de Hogar' : 'Integrante Titular'}
                sub={childrenList.length > 0 ? childrenList.length + ' hijo(a)' + (childrenList.length > 1 ? 's' : '') + ' a cargo' : 'Sin hijos menores registrados'}
                subColor={childrenList.length > 0 ? '#0369A1' : undefined}
                subBold={childrenList.length > 0} />
            </div>

            {/* Sección 1: Núcleo Familiar */}
            <div className="p360-section">
              <SectionHeader icon={Users} title="Núcleo Familiar Registrado" count={familyMembers.length}
                right={childrenList.length > 0 ? (
                  <span style={{ fontSize: '.7rem', fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '.15rem .55rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '.28rem' }}>
                    <Users size={10} />{childrenList.length} Hijo(a){childrenList.length > 1 ? 's' : ''} menor{childrenList.length > 1 ? 'es' : ''}
                  </span>
                ) : null}
              />
              {familyMembers.length === 0 ? (
                <div style={{ padding: '.6rem .85rem', backgroundColor: '#F8FAF9', borderRadius: '8px', fontSize: '.82rem', color: '#6A8480' }}>No registra integrantes adicionales al titular.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="p360-table">
                    <thead>
                      <tr><th>NOMBRE Y APELLIDO COMPLETO</th><th>PARENTESCO</th><th>EDAD</th><th>DOCUMENTO DE IDENTIDAD</th></tr>
                    </thead>
                    <tbody>
                      {familyMembers.map((m) => {
                        const memberName = m.fullName || m.name || 'Sin nombre';
                        const memberKinship = m.kinship || m.relationship || 'Familiar';
                        const isChild = memberKinship.toLowerCase().includes('hijo') || memberKinship.toLowerCase().includes('hija');
                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                {isChild ? <Users size={12} color="#0284C7" /> : <User size={12} color="#6B7280" />}
                                <div>
                                  <div style={{ fontWeight: 700, color: '#142724', fontSize: '.83rem' }}>{memberName}</div>
                                  {isChild && <div style={{ fontSize: '.69rem', color: '#0369A1', fontWeight: 600 }}>Hijo(a) dependiente</div>}
                                </div>
                              </div>
                            </td>
                            <td><span style={{ backgroundColor: isChild ? '#E0F2FE' : '#E4F5F1', color: isChild ? '#0369A1' : '#094D46', fontSize: '.71rem', fontWeight: 700, padding: '.16rem .52rem', borderRadius: '12px' }}>{memberKinship}</span></td>
                            <td style={{ color: '#4B635F', fontWeight: 600 }}>{m.age ? m.age + ' años' : '—'}</td>
                            <td style={{ color: '#4B635F' }}>{m.documentNumber ? <span><strong>{m.documentType || 'DOC'}</strong>: {m.documentNumber}</span> : <em style={{ color: '#9CA3AF' }}>Sin documento / En trámite</em>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sección 2: Programas */}
            <div className="p360-section">
              <SectionHeader icon={FolderGit2} title="Programas y Participación" count={linkedPrograms.length} />
              {linkedPrograms.length === 0 ? (
                <div style={{ padding: '.6rem .85rem', backgroundColor: '#F8FAF9', borderRadius: '8px', fontSize: '.82rem', color: '#6A8480' }}>No vinculado a ningún programa de las 3 líneas.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="p360-table">
                    <thead><tr><th>PROGRAMA</th><th>LÍNEA DE ACCIÓN</th><th>FECHA INGRESO</th><th>ESTADO</th></tr></thead>
                    <tbody>
                      {linkedPrograms.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700, color: '#142724' }}>{p.programName}</td>
                          <td style={{ color: '#4B635F' }}>{p.lineName}</td>
                          <td style={{ color: '#4B635F' }}>{p.enrollmentDate}</td>
                          <td><ProgramStatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sección 3: Historial */}
            <div className="p360-section">
              <SectionHeader icon={Package} title="Historial de Ayudas Entregadas y Seguimiento" count={attentions.length + followups.length} />
              {attentions.length === 0 && followups.length === 0 ? (
                <div style={{ padding: '.6rem .85rem', backgroundColor: '#F8FAF9', borderRadius: '8px', fontSize: '.82rem', color: '#6A8480' }}>Aún no registra ayudas ni seguimientos.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="p360-table">
                    <thead><tr><th>FECHA</th><th>TIPO DE REGISTRO</th><th>DETALLE / OBSERVACIÓN</th><th>RESPONSABLE</th><th>ESTADO / SEMÁFORO</th></tr></thead>
                    <tbody>
                      {attentions.map((att) => (
                        <tr key={att.id}>
                          <td style={{ fontWeight: 600, color: '#5A736F', whiteSpace: 'nowrap' }}>{att.date}</td>
                          <td><AttentionTypeBadge typeId={att.attentionTypeId} /></td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#142724', fontSize: '.82rem' }}>{att.attentionTypeName}</div>
                            <div style={{ fontSize: '.74rem', color: '#4B635F', marginTop: '2px' }}>Cantidad: <strong>{att.quantity} {att.unit}</strong>{att.notes ? ' • ' + att.notes : ''}</div>
                          </td>
                          <td style={{ fontSize: '.78rem', color: '#5A736F' }}>{att.responsibleOrg}</td>
                          <td><span style={{ fontSize: '.71rem', fontWeight: 700, backgroundColor: '#E8F7F1', color: '#178358', padding: '.16rem .52rem', borderRadius: '12px' }}>Entregada</span></td>
                        </tr>
                      ))}
                      {followups.map((fol) => (
                        <tr key={fol.id}>
                          <td style={{ fontWeight: 600, color: '#5A736F', whiteSpace: 'nowrap' }}>{fol.date}</td>
                          <td><span style={{ backgroundColor: '#FEF7EA', color: '#966708', fontSize: '.71rem', fontWeight: 700, padding: '.16rem .48rem', borderRadius: '12px' }}>Seguimiento</span></td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#142724', fontSize: '.82rem' }}>Evolución: {fol.status}</div>
                            <div style={{ fontSize: '.74rem', color: '#4B635F', marginTop: '2px' }}>{fol.observation}</div>
                            {fol.pendingAction && <div style={{ fontSize: '.71rem', color: '#094D46', fontWeight: 600, marginTop: '2px' }}><strong>Tarea:</strong> {fol.pendingAction}</div>}
                          </td>
                          <td style={{ fontSize: '.78rem', color: '#5A736F' }}>{fol.responsibleStaff}</td>
                          <td><TrafficLightBadge nextContactDate={fol.nextContactDate} status={fol.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bloque de firmas */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px dashed #D1D5DB' }}>
              <div style={{ fontSize: '.74rem', color: '#6B7280', marginBottom: '1.75rem', textAlign: 'center', lineHeight: 1.55, maxWidth: '680px', margin: '0 auto 1.75rem auto' }}>
                Este expediente certifica la vinculación, atención humanitaria y seguimiento continuo del beneficiario en el marco del Proyecto URABÁ-PAÍS, garantizando el tratamiento ético y confidencial de su información.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #111827', width: '75%', margin: '0 auto .4rem auto' }} />
                  <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#111827' }}>Firma del Funcionario Técnico</div>
                  <div style={{ fontSize: '.7rem', color: '#4B5563' }}>Consorcio COOPI / FADV / HIAS / HI — Sede Urabá</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #111827', width: '75%', margin: '0 auto .4rem auto' }} />
                  <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#111827' }}>Firma / Huella del Beneficiario(a) Titular</div>
                  <div style={{ fontSize: '.7rem', color: '#4B5563' }}>{beneficiary.fullName} • {beneficiary.documentType}: {beneficiary.documentNumber || beneficiary.internalCode}</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
