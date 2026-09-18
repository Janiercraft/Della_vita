import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import { programRepository } from '../programs/services/programRepository';
import { attentionRepository } from '../attentions/services/attentionRepository';
import { PROGRAMS_CATALOG } from '../../core/domain/programRules';
import { INTERVENTION_LINES } from '../../core/constants';
import { Toast } from '../../shared/components/Modal';
import InteractiveLogoCarousel from '../../shared/layout/InteractiveLogoCarousel';
import {
  Sparkles,
  FolderGit2,
  Package,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Users,
  User,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Compass
} from 'lucide-react';

// Mapeo fotográfico institucional para los programas
const PROGRAM_IMAGES = {
  'prog-001': '/programs/prog-001.jpg',
  'prog-002': '/programs/prog-002.jpg',
  'prog-003': '/programs/prog-003.jpg',
  'prog-004': '/programs/prog-004.jpg',
  'prog-005': '/programs/prog-005.jpg'
};

// Diapositivas de la vista tipo Home
const HERO_SLIDES = [
  {
    id: 1,
    image: '/hero/slide1.jpg',
    tag: 'Asistencia y Protección Humanitaria',
    title: 'Ruta Humanitaria y Acompañamiento Integral en Urabá',
    desc: 'Atención digna, entrega de kits de emergencia y orientación en derechos para familias y comunidades de Apartadó, Turbo y Necoclí.',
    btnText: 'Explorar Catálogo'
  },
  {
    id: 2,
    image: '/hero/slide2.jpg',
    tag: 'Medios de Vida y Autonomía',
    title: 'Impulso al Emprendimiento y Desarrollo Sostenible',
    desc: 'Fortalecimiento de iniciativas productivas, capital semilla y formación técnica para mujeres y jóvenes de la región.',
    btnText: 'Ver Oportunidades'
  },
  {
    id: 3,
    image: '/hero/slide3.jpg',
    tag: 'Salud Integral y Bienestar Familiar',
    title: 'Atención Psicosocial, Salud Reproductiva y Prevención',
    desc: 'Círculos comunitarios de sanación, primeros auxilios psicológicos y activación de rutas seguras de atención médica preventiva.',
    btnText: 'Conocer Servicios'
  }
];

export function BeneficiaryPortalView() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-programs' | 'my-attentions'
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [selectedLineFilter, setSelectedLineFilter] = useState('all');
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'

  // Estado del Carrusel Hero Superior
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Referencia para el carrusel de tarjetas de programas
  const cardsTrackRef = useRef(null);

  // Auto-avance del Hero Carousel cada 5 segundos
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5200);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Obtener datos en vivo del beneficiario logueado
  const beneficiary = useMemo(() => {
    return beneficiaryRepository.getById(currentUser?.beneficiaryId) || {
      id: currentUser?.beneficiaryId || 'ben-001',
      fullName: currentUser?.name || 'María Elena Rivas Palacios',
      internalCode: currentUser?.internalCode || 'UP-2026-0001',
      municipality: currentUser?.territory || 'Apartadó',
      documentType: 'CC',
      documentNumber: '1038123456',
      familyMembers: []
    };
  }, [currentUser]);

  // Obtener vinculaciones en tiempo real
  const myEnrollments = useMemo(() => {
    return programRepository.getByBeneficiaryId(beneficiary.id) || [];
  }, [beneficiary.id, feedbackMessage]);

  // Obtener atenciones y seguimientos en tiempo real
  const myAttentions = useMemo(() => {
    return (attentionRepository.getAttentions() || []).filter(a => a.beneficiaryId === beneficiary.id);
  }, [beneficiary.id]);

  const myFollowups = useMemo(() => {
    return (attentionRepository.getFollowUps() || []).filter(f => f.beneficiaryId === beneficiary.id);
  }, [beneficiary.id]);

  const enrolledProgramIds = useMemo(() => {
    return new Set(myEnrollments.map(e => e.programId));
  }, [myEnrollments]);

  // Catálogo de programas filtrado por línea
  const filteredCatalog = useMemo(() => {
    if (selectedLineFilter === 'all') return PROGRAMS_CATALOG;
    return PROGRAMS_CATALOG.filter(p => p.lineId === selectedLineFilter);
  }, [selectedLineFilter]);

  // Desplazamiento manual en el carrusel de tarjetas
  const handleScrollCards = (direction) => {
    if (!cardsTrackRef.current) return;
    const scrollAmount = direction === 'left' ? -360 : 360;
    cardsTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Acción: Postularme a un programa
  const handleApplyToProgram = (program) => {
    try {
      programRepository.createEnrollment({
        beneficiaryId: beneficiary.id,
        programId: program.id,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'inscrito',
        notes: 'Postulación realizada directamente por el beneficiario desde el Portal Ciudadano.'
      });

      setFeedbackMessage({
        type: 'success',
        text: `¡Excelente! Te has postulado exitosamente al programa "${program.name}". El equipo técnico de ${beneficiary.municipality} revisará tu solicitud.`
      });
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'No fue posible registrar la postulación.'
      });
    }
  };

  const familyMembers = beneficiary.familyMembers || [];
  const children = familyMembers.filter(m => (m.kinship || m.relationship || '').toLowerCase().includes('hijo'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1360px', margin: '0 auto' }}>
      <style>{`
        /* Hero Carousel Animations */
        .hero-carousel-root {
          position: relative;
          width: 100%;
          height: 340px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(6, 54, 48, 0.18);
          background-color: #042420;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s ease-in-out, transform 0.8s ease-out;
          transform: scale(1.02);
          pointer-events: none;
        }

        .hero-slide.active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        .hero-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
        }

        .hero-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(3, 26, 22, 0.92) 0%, rgba(4, 38, 33, 0.75) 45%, rgba(4, 38, 33, 0.3) 100%);
          display: flex;
          align-items: center;
          padding: 0 3.5rem;
          box-sizing: border-box;
        }

        .hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(6, 54, 48, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .hero-nav-btn:hover {
          background: rgba(13, 92, 84, 0.95);
          transform: translateY(-50%) scale(1.08);
          border-color: #4EE4CB;
        }

        /* Program Cards Track */
        .cards-carousel-viewport {
          display: flex;
          gap: 1.4rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0.6rem 0.2rem 1.4rem 0.2rem;
          scrollbar-width: thin;
          scrollbar-color: #1CA89D #E2EAE7;
        }

        .cards-carousel-viewport::-webkit-scrollbar {
          height: 7px;
        }

        .cards-carousel-viewport::-webkit-scrollbar-thumb {
          background-color: #1CA89D;
          border-radius: 10px;
        }

        .cards-carousel-viewport::-webkit-scrollbar-track {
          background: #EAF2F0;
          border-radius: 10px;
        }

        .program-card-modern {
          background-color: #FFFFFF;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(6, 54, 48, 0.08);
          border: 1.5px solid #E2EAE7;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .program-card-modern:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 32px rgba(6, 54, 48, 0.16);
          border-color: #20BFA8;
        }

        .program-card-modern.enrolled {
          border-color: #22C55E;
          background: linear-gradient(180deg, #FFFFFF 0%, #F6FEF9 100%);
        }

        .hero-title {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: -0.025em;
          margin: 0 0 0.65rem 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }

        .hero-desc {
          font-size: 0.96rem;
          color: #D2ECE5;
          line-height: 1.55;
          margin: 0 0 1.25rem 0;
          text-shadow: 0 1px 6px rgba(0,0,0,0.5);
        }

        @media (max-width: 900px) {
          .hero-carousel-root {
            height: 340px;
          }
          .hero-slide-overlay {
            padding: 0 1.5rem;
          }
          .hero-title {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 600px) {
          .hero-carousel-root {
            height: 400px;
          }
          .hero-slide-overlay {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(3, 26, 22, 0.4) 0%, rgba(4, 38, 33, 0.9) 100%);
            align-items: flex-end;
          }
          .hero-nav-btn {
            display: none;
          }
          .hero-title {
            font-size: 1.35rem;
          }
          .hero-desc {
            font-size: 0.85rem;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* 1. HERO CAROUSEL: VISTA TIPO HOME CON FOTOGRAFÍAS HUMANITARIAS */}
      {/* ========================================================= */}
      <div
        className="hero-carousel-root"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.image} alt={slide.title} className="hero-slide-img" />
            <div className="hero-slide-overlay">
              <div style={{ maxWidth: '640px', color: '#FFFFFF' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: 'rgba(78, 228, 203, 0.22)',
                    border: '1px solid rgba(78, 228, 203, 0.45)',
                    color: '#4EE4CB',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '20px',
                    marginBottom: '0.85rem'
                  }}
                >
                  <Sparkles size={14} />
                  {slide.tag}
                </span>

                <h1 className="hero-title">
                  {slide.title}
                </h1>

                <p className="hero-desc">
                  {slide.desc}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    backgroundColor: '#1CA89D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '11px',
                    padding: '0.7rem 1.35rem',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    boxShadow: '0 4px 16px rgba(28, 168, 157, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#168D84'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1CA89D'}
                >
                  <span>{slide.btnText}</span>
                  <ArrowRight size={17} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Botones de navegación del carrusel */}
        <button
          type="button"
          className="hero-nav-btn"
          style={{ left: '16px' }}
          onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="Diapositiva anterior"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          className="hero-nav-btn"
          style={{ right: '16px' }}
          onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
          aria-label="Diapositiva siguiente"
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>

        {/* Indicadores de diapositiva (dots) */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '28px' : '9px',
                height: '9px',
                borderRadius: '5px',
                backgroundColor: i === currentSlide ? '#4EE4CB' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TARJETA DE BIENVENIDA Y PERFIL DEL BENEFICIARIO         */}
      {/* ========================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #063630 0%, #0A4A42 100%)',
          borderRadius: '18px',
          padding: '1.6rem 2rem',
          color: '#FFFFFF',
          boxShadow: '0 6px 22px rgba(6, 54, 48, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C59E 0%, #158F83 100%)',
                color: '#FFFFFF',
                fontSize: '1.4rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {beneficiary.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(78, 228, 203, 0.2)',
                    color: '#4EE4CB',
                    border: '1px solid rgba(78, 228, 203, 0.35)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px'
                  }}
                >
                  EXPEDIENTE: {beneficiary.internalCode}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#E0EBE9',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ShieldCheck size={14} color="#4EE4CB" /> Habeas Data Autorizado
                </span>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0.4rem 0 0.2rem 0', letterSpacing: '-0.02em' }}>
                Bienvenido(a), {beneficiary.fullName}
              </h2>

              <div style={{ fontSize: '0.88rem', color: '#B3D6CF', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#4EE4CB" /> Municipio: <strong style={{ color: '#FFFFFF' }}>{beneficiary.municipality}</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} color="#4EE4CB" /> Familiares registrados: <strong style={{ color: '#FFFFFF' }}>{familyMembers.length}</strong>
                </span>
                {children.length > 0 && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} color="#4EE4CB" /> Hijos a cargo: <strong style={{ color: '#FFFFFF' }}>{children.length}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#4EE4CB',
                border: '1px solid rgba(78, 228, 203, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-block'
              }}
            >
              Portal de Autogestión Ciudadana
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SELECTOR DE PESTAÑAS DEL PORTAL                        */}
      {/* ========================================================= */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2EAE7',
          padding: '0.55rem',
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          boxShadow: '0 3px 10px rgba(9, 77, 70, 0.05)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 800,
            border: activeTab === 'catalog' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'catalog' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'catalog' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'catalog' ? '0 4px 12px rgba(9, 77, 70, 0.25)' : 'none'
          }}
        >
          <BookOpen size={17} />
          <span>1. Catálogo de Programas y Oportunidades</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-programs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 800,
            border: activeTab === 'my-programs' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'my-programs' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'my-programs' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'my-programs' ? '0 4px 12px rgba(9, 77, 70, 0.25)' : 'none'
          }}
        >
          <FolderGit2 size={17} />
          <span>2. Mis Programas y Solicitudes ({myEnrollments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-attentions')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 800,
            border: activeTab === 'my-attentions' ? '1px solid #094D46' : '1px solid transparent',
            backgroundColor: activeTab === 'my-attentions' ? '#094D46' : '#F4F7F6',
            color: activeTab === 'my-attentions' ? '#FFFFFF' : '#39524E',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'my-attentions' ? '0 4px 12px rgba(9, 77, 70, 0.25)' : 'none'
          }}
        >
          <Package size={17} />
          <span>3. Mis Ayudas Recibidas y Citas ({myAttentions.length + myFollowups.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* CONTENIDO PESTAÑA 1: CATÁLOGO DE PROGRAMAS EN CARRUSEL    */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Barra de Encabezado y Filtros */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#11221F', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
                Programas Disponibles en {beneficiary.municipality}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#5C7470', margin: 0 }}>
                Explora los programas del Consorcio (COOPI, FADV, HIAS, HI) y postúlate a las líneas de tu interés.
              </p>
            </div>

            {/* Selector de modo y botones de navegación */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Botones de navegación del carrusel */}
              {viewMode === 'carousel' && (
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => handleScrollCards('left')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CFDDD8',
                      color: '#094D46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                    title="Desplazar a la izquierda"
                  >
                    <ChevronLeft size={18} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollCards('right')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CFDDD8',
                      color: '#094D46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                    title="Desplazar a la derecha"
                  >
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </button>
                </div>
              )}

              {/* Conmutador de vista Carrusel / Cuadrícula */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#EAF2F0',
                  padding: '3px',
                  borderRadius: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('carousel')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: viewMode === 'carousel' ? '#094D46' : 'transparent',
                    color: viewMode === 'carousel' ? '#FFFFFF' : '#4E6B65',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Compass size={14} /> Carrusel
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: viewMode === 'grid' ? '#094D46' : 'transparent',
                    color: viewMode === 'grid' ? '#FFFFFF' : '#4E6B65',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <LayoutGrid size={14} /> Cuadrícula
                </button>
              </div>
            </div>
          </div>

          {/* Filtros por Línea de Intervención */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSelectedLineFilter('all')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: selectedLineFilter === 'all' ? '1.5px solid #094D46' : '1px solid #CFDDD8',
                backgroundColor: selectedLineFilter === 'all' ? '#094D46' : '#FFFFFF',
                color: selectedLineFilter === 'all' ? '#FFFFFF' : '#39524E',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Todas las Líneas
            </button>
            {INTERVENTION_LINES.map(line => (
              <button
                key={line.id}
                type="button"
                onClick={() => setSelectedLineFilter(line.id)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: selectedLineFilter === line.id ? '1.5px solid #094D46' : '1px solid #CFDDD8',
                  backgroundColor: selectedLineFilter === line.id ? '#094D46' : '#FFFFFF',
                  color: selectedLineFilter === line.id ? '#FFFFFF' : '#39524E',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {line.name}
              </button>
            ))}
          </div>

          {/* Carrusel o Cuadrícula de Tarjetas de Programas */}
          <div
            ref={cardsTrackRef}
            className={viewMode === 'carousel' ? 'cards-carousel-viewport' : ''}
            style={
              viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.4rem' }
                : undefined
            }
          >
            {filteredCatalog.map(prog => {
              const isEnrolled = enrolledProgramIds.has(prog.id);
              const cardImg = PROGRAM_IMAGES[prog.id] || '/programs/prog-001.jpg';

              return (
                <div
                  key={prog.id}
                  className={`program-card-modern ${isEnrolled ? 'enrolled' : ''}`}
                  style={
                    viewMode === 'carousel'
                      ? { width: '330px', flexShrink: 0 }
                      : undefined
                  }
                >
                  {/* Fotografía Temática del Modelo de Negocio */}
                  <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                    <img
                      src={cardImg}
                      alt={prog.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />

                    {/* Gradiente oscuro sobre la foto para destacar los tags */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(10, 30, 26, 0.75) 0%, transparent 65%)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Tag de Categoría / Línea */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(6, 44, 38, 0.88)',
                        backdropFilter: 'blur(4px)',
                        color: '#4EE4CB',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(78, 228, 203, 0.35)'
                      }}
                    >
                      {prog.lineName}
                    </span>

                    {/* Badge de Inscripción */}
                    {isEnrolled && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: '#22C55E',
                          color: '#FFFFFF',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                        }}
                      >
                        <CheckCircle2 size={13} strokeWidth={2.5} /> Inscrito
                      </span>
                    )}
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1.08rem',
                          fontWeight: 800,
                          color: '#11221F',
                          margin: '0 0 0.45rem 0',
                          lineHeight: 1.3
                        }}
                      >
                        {prog.name}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: '#526964',
                          lineHeight: 1.55,
                          margin: 0
                        }}
                      >
                        {prog.description}
                      </p>

                      <div
                        style={{
                          marginTop: '0.85rem',
                          fontSize: '0.76rem',
                          color: '#65827D',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem'
                        }}
                      >
                        <MapPin size={13} color="#0D5C53" />
                        <span>Territorio prioritario:</span>
                        <strong style={{ color: '#1A332F' }}>Apartadó • Turbo • Necoclí</strong>
                      </div>
                    </div>

                    {/* Botón de Postulación o Estado Participando */}
                    <div>
                      {isEnrolled ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            backgroundColor: '#DCFCE7',
                            border: '1px solid #86EFAC',
                            borderRadius: '10px',
                            padding: '0.65rem',
                            textAlign: 'center',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            color: '#166534'
                          }}
                        >
                          <CheckCircle2 size={16} /> Ya estás postulado / participando
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyToProgram(prog)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#094D46',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 3px 10px rgba(9, 77, 70, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#073F39';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#094D46';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <span>Solicitar Vinculación / Postularme</span>
                          <ArrowRight size={16} strokeWidth={2.4} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTENIDO PESTAÑA 2: MIS PROGRAMAS Y SOLICITUDES          */}
      {/* ========================================================= */}
      {activeTab === 'my-programs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#11221F', margin: '0 0 0.25rem 0' }}>
              Mis Programas y Solicitudes Activas ({myEnrollments.length})
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#5C7470', margin: 0 }}>
              Consulta el estado oficial de tus vinculaciones y el acompañamiento brindado por el equipo técnico.
            </p>
          </div>

          {myEnrollments.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px dashed #CADBD6',
                padding: '3rem 2rem',
                textAlign: 'center'
              }}
            >
              <FolderGit2 size={42} color="#7BA098" style={{ margin: '0 auto 0.85rem auto' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#11221F', marginBottom: '0.35rem' }}>
                Aún no tienes programas vinculados
              </div>
              <p style={{ fontSize: '0.88rem', color: '#5C7470', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                Ve al Catálogo de Programas y postúlate a las líneas de ayuda humanitaria, salud, o emprendimiento disponibles en {beneficiary.municipality}.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                style={{
                  backgroundColor: '#094D46',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.4rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Ir al Catálogo de Programas
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
              {myEnrollments.map(enr => {
                const prog = PROGRAMS_CATALOG.find(p => p.id === enr.programId) || {
                  name: 'Programa Institucional',
                  lineName: 'Línea de Atención',
                  description: 'Acompañamiento integral'
                };
                const cardImg = PROGRAM_IMAGES[enr.programId] || '/programs/prog-001.jpg';

                return (
                  <div
                    key={enr.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1.5px solid #BBF7D0',
                      boxShadow: '0 4px 14px rgba(9, 77, 70, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                      <img src={cardImg} alt={prog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6, 44, 38, 0.8) 0%, transparent 70%)' }} />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px'
                        }}
                      >
                        ✓ Estado: {enr.status?.toUpperCase() || 'INSCRITO'}
                      </span>
                    </div>

                    <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.74rem', color: '#094D46', fontWeight: 800 }}>
                        {prog.lineName}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#11221F', margin: 0 }}>
                        {prog.name}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#526964', margin: 0, lineHeight: 1.5 }}>
                        {prog.description}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: '#6A8480', marginTop: '0.5rem', borderTop: '1px solid #EAEFEF', paddingTop: '0.65rem' }}>
                        <div>Fecha de postulación: <strong>{enr.enrollmentDate || 'Reciente'}</strong></div>
                        <div style={{ marginTop: '0.2rem' }}>Territorio: <strong>{beneficiary.municipality}</strong></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTENIDO PESTAÑA 3: MIS AYUDAS Y CITAS                    */}
      {/* ========================================================= */}
      {activeTab === 'my-attentions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#11221F', margin: '0 0 0.25rem 0' }}>
              Mis Ayudas Recibidas y Citas Programadas ({myAttentions.length + myFollowups.length})
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#5C7470', margin: 0 }}>
              Historial transparente de kits humanitarios entregados, sesiones de orientación y citas de seguimiento.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {myAttentions.map(att => (
              <div
                key={att.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAE7',
                  padding: '1.35rem',
                  boxShadow: '0 3px 12px rgba(9, 77, 70, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: '#E8F7F1',
                      color: '#094D46',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px'
                    }}
                  >
                    Atención Humanitaria
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 600 }}>
                    {att.date || 'Fecha registrada'}
                  </span>
                </div>

                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#11221F' }}>
                  {att.title || att.type || 'Entrega de Ayuda Humanitaria'}
                </div>

                <p style={{ fontSize: '0.84rem', color: '#526964', margin: 0, lineHeight: 1.5 }}>
                  {att.notes || att.description || 'Acompañamiento técnico en territorio.'}
                </p>

                <div style={{ fontSize: '0.76rem', color: '#6A8480', borderTop: '1px solid #EAEFEF', paddingTop: '0.5rem' }}>
                  Profesional a cargo: <strong>{att.professionalName || 'Equipo Técnico del Consorcio'}</strong>
                </div>
              </div>
            ))}

            {myFollowups.map(fol => (
              <div
                key={fol.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAE7',
                  padding: '1.35rem',
                  boxShadow: '0 3px 12px rgba(9, 77, 70, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px'
                    }}
                  >
                    Seguimiento en Terreno
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#6A8480', fontWeight: 600 }}>
                    {fol.scheduledDate || fol.date || 'Próximamente'}
                  </span>
                </div>

                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#11221F' }}>
                  {fol.objective || fol.notes || 'Seguimiento psicosocial y familiar'}
                </div>

                <p style={{ fontSize: '0.84rem', color: '#526964', margin: 0, lineHeight: 1.5 }}>
                  {fol.notes || 'Revisión periódica de bienestar familiar y avance en programas.'}
                </p>

                <div style={{ fontSize: '0.76rem', color: '#6A8480', borderTop: '1px solid #EAEFEF', paddingTop: '0.5rem' }}>
                  Estado de atención: <strong>{fol.status?.toUpperCase() || 'EN SEGUIMIENTO'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FOOTER INSTITUCIONAL CON CARRUSEL DE LOGOS OFICIALES    */}
      {/* ========================================================= */}
      <footer
        style={{
          marginTop: '2rem',
          padding: '2rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2EAE7',
          textAlign: 'center',
          boxShadow: '0 4px 18px rgba(6, 54, 48, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: '#47635E',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          CONSORCIO HUMANITARIO LÍDER DEL PROYECTO
        </div>

        {/* Carrusel interactivo de logos en movimiento continuo */}
        <InteractiveLogoCarousel />

        <div
          style={{
            fontSize: '0.76rem',
            color: '#7B948F',
            maxWidth: '620px',
            lineHeight: 1.5,
            marginTop: '0.35rem'
          }}
        >
          COOPI • FADV • HIAS • HI | Sistema Integrado de Gestión Humanitaria
          <br />
          Territorio Urabá (Apartadó, Turbo, Necoclí) • Habeas Data y Tratamiento Confidencial de Información
        </div>
      </footer>

      {/* Notificación Toast de Feedback */}
      {feedbackMessage && (
        <Toast
          type={feedbackMessage.type}
          message={feedbackMessage.text}
          onClose={() => setFeedbackMessage(null)}
        />
      )}
    </div>
  );
}

export default BeneficiaryPortalView;
