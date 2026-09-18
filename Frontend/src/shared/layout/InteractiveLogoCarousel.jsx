import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ORGANIZATIONS = [
  {
    id: 'coopi',
    name: 'COOPI',
    fullName: 'COOPI - Cooperazione Internazionale',
    src: '/logos/coopi.png',
    svgFallback: (
      <svg viewBox="0 0 78 26" height="22" fill="currentColor" style={{ display: 'block' }}>
        <g transform="translate(1, 2)">
          <circle cx="9" cy="3.5" r="2.5" />
          <path d="M2 13 C4 8, 7 6.5, 9 8 C11 6.5, 14 8, 16 13 C12 11, 6 11, 2 13 Z" />
          <path d="M7 10.5 C8 13.5, 8.5 16, 9 19.5 C9.5 16, 10 13.5, 11 10.5 Z" />
        </g>
        <text x="22" y="14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing="0.05em">
          COOPI
        </text>
        <text x="22" y="20.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="3.8" letterSpacing="0.02em" opacity="0.82">
          COOPERAZIONE INTERNAZIONALE
        </text>
      </svg>
    )
  },
  {
    id: 'fadv',
    name: 'FADV',
    fullName: "Fondazione L'Albero della Vita",
    src: '/logos/fadv.png',
    svgFallback: (
      <svg viewBox="0 0 54 26" height="22" fill="currentColor" style={{ display: 'block' }}>
        <text x="1" y="14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.04em">
          FADV
        </text>
        <line x1="1" y1="16.5" x2="50" y2="16.5" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
        <text x="1" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="3.5" letterSpacing="0.02em" opacity="0.82">
          L'ALBERO DELLA VITA
        </text>
      </svg>
    )
  },
  {
    id: 'hias',
    name: 'HIAS',
    fullName: 'HIAS - Welcome the stranger. Protect the refugee.',
    src: '/logos/hias.png',
    svgFallback: (
      <svg viewBox="0 0 46 26" height="18" fill="currentColor" style={{ display: 'block' }}>
        <text x="0" y="17" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15.5" letterSpacing="0.06em">
          HIAS
        </text>
      </svg>
    )
  },
  {
    id: 'hi',
    name: 'HI',
    fullName: 'Humanity & Inclusion (HI)',
    src: '/logos/hi.png',
    svgFallback: (
      <svg viewBox="0 0 30 26" height="20" fill="currentColor" style={{ display: 'block' }}>
        <text x="1" y="17" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" letterSpacing="0.05em">
          HI
        </text>
      </svg>
    )
  }
];

function CarouselLogoItem({ org, isHovered, onHover, onLeave }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="carousel-logo-card"
      onMouseEnter={() => onHover(org)}
      onMouseLeave={onLeave}
      title={org.fullName}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem 1.15rem',
        margin: '0 0.5rem',
        borderRadius: '10px',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.06)',
        color: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: isHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1) translateY(0)',
        boxShadow: isHovered ? '0 6px 16px rgba(0, 0, 0, 0.4)' : 'none',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {!imgError && org.src ? (
        <img
          src={org.src}
          alt={org.name}
          onError={() => setImgError(true)}
          draggable={false}
          style={{
            height: '24px',
            maxWidth: '68px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))'
          }}
        />
      ) : (
        org.svgFallback
      )}
    </div>
  );
}

export default function InteractiveLogoCarousel({ style }) {
  const [activeOrg, setActiveOrg] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Generar 3 repeticiones consecutivas para un bucle infinito perfectamente continuo
  const duplicatedLogos = [...ORGANIZATIONS, ...ORGANIZATIONS, ...ORGANIZATIONS];

  const handleMouseDown = (e) => {
    isDragging.current = true;
    setIsPaused(true);
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleScrollManual = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = direction === 'left' ? -140 : 140;
    trackRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '440px', margin: '0 auto', ...style }}>
      <style>{`
        @keyframes infiniteLogoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .logo-carousel-container {
          position: relative;
          display: flex;
          align-items: center;
          background: #072C27;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 0.45rem 0.6rem;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        /* Gradientes sutiles a los lados para entrada y salida suave */
        .logo-carousel-fade-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 36px;
          background: linear-gradient(to right, #072C27 20%, transparent 100%);
          z-index: 3;
          pointer-events: none;
        }

        .logo-carousel-fade-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 36px;
          background: linear-gradient(to left, #072C27 20%, transparent 100%);
          z-index: 3;
          pointer-events: none;
        }

        .logo-carousel-viewport {
          display: flex;
          overflow-x: hidden;
          width: 100%;
          cursor: grab;
          user-select: none;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .logo-carousel-viewport::-webkit-scrollbar {
          display: none;
        }

        .logo-carousel-viewport:active {
          cursor: grabbing;
        }

        .logo-carousel-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: infiniteLogoScroll 18s linear infinite;
        }

        .logo-carousel-container:hover .logo-carousel-track,
        .logo-carousel-track.paused {
          animation-play-state: paused !important;
        }

        .logo-carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(7, 44, 39, 0.85);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #E2EFEA;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
          opacity: 0;
          transition: all 0.2s ease;
          padding: 0;
        }

        .logo-carousel-container:hover .logo-carousel-nav-btn {
          opacity: 0.9;
        }

        .logo-carousel-nav-btn:hover {
          opacity: 1 !important;
          background: #0F5349;
          color: #FFFFFF;
          transform: translateY(-50%) scale(1.1);
        }

        .logo-carousel-nav-btn.prev {
          left: 6px;
        }

        .logo-carousel-nav-btn.next {
          right: 6px;
        }
      `}</style>

      {/* Contenedor del Carrusel */}
      <div
        className="logo-carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setActiveOrg(null);
        }}
      >
        {/* Botón Navegación Izquierda */}
        <button
          type="button"
          className="logo-carousel-nav-btn prev"
          onClick={() => handleScrollManual('left')}
          title="Ver logos anteriores"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Gradientes en extremos */}
        <div className="logo-carousel-fade-left" />
        <div className="logo-carousel-fade-right" />

        {/* Viewport y Pista Deslizante */}
        <div
          className="logo-carousel-viewport"
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
        >
          <div className={`logo-carousel-track ${isPaused ? 'paused' : ''}`}>
            {duplicatedLogos.map((org, index) => (
              <CarouselLogoItem
                key={`${org.id}-${index}`}
                org={org}
                isHovered={activeOrg?.id === org.id}
                onHover={(selected) => setActiveOrg(selected)}
                onLeave={() => setActiveOrg(null)}
              />
            ))}
          </div>
        </div>

        {/* Botón Navegación Derecha */}
        <button
          type="button"
          className="logo-carousel-nav-btn next"
          onClick={() => handleScrollManual('right')}
          title="Ver siguientes logos"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Subtítulo dinámico con el nombre de la organización sobre la que se hace hover */}
      <div
        style={{
          minHeight: '18px',
          marginTop: '0.4rem',
          fontSize: '0.73rem',
          color: activeOrg ? '#0D5C53' : '#7B948F',
          fontWeight: activeOrg ? 700 : 500,
          textAlign: 'center',
          transition: 'color 0.2s ease',
          letterSpacing: activeOrg ? '0.01em' : 'normal'
        }}
      >
        {activeOrg ? activeOrg.fullName : 'Habeas Data • Tratamiento Ético y Confidencial de Información'}
      </div>
    </div>
  );
}
