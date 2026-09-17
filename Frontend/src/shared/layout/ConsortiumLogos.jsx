import React, { useState } from 'react';

/**
 * Componente que renderiza los logos de las 4 organizaciones del consorcio:
 * - COOPI (Cooperazione Internazionale)
 * - FADV (Fondazione L'Albero della Vita)
 * - HIAS
 * - HI (Humanity & Inclusion)
 *
 * Cuenta con fallback dual:
 * 1. Intenta cargar imagen personalizada desde /logos/{org}.(svg|png)
 * 2. Si no existe o da error, renderiza el vector SVG monocromático blanco de alta fidelidad.
 */

function LogoItem({ id, name, fullName, customSrc, height = '20px', maxWidth = '54px', svgComponent }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      title={fullName}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        transition: 'all 0.2s ease',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
        opacity: 0.9,
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.9';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {!imgFailed && customSrc ? (
        <img
          src={customSrc}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{
            height: height,
            maxWidth: maxWidth,
            width: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      ) : (
        svgComponent
      )}
    </div>
  );
}

export default function ConsortiumLogos({ style, className } = {}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.35rem 0.2rem',
        color: '#FFFFFF',
        ...style
      }}
    >
      {/* 1. COOPI */}
      <LogoItem
        id="coopi"
        name="COOPI"
        fullName="COOPI - Cooperazione Internazionale"
        customSrc="/logos/coopi.png"
        height="21px"
        maxWidth="54px"
        svgComponent={
          <svg
            viewBox="0 0 78 26"
            height="21"
            fill="currentColor"
            style={{ display: 'block' }}
          >
            <g transform="translate(1, 2)">
              <circle cx="9" cy="3.5" r="2.5" />
              <path d="M2 13 C4 8, 7 6.5, 9 8 C11 6.5, 14 8, 16 13 C12 11, 6 11, 2 13 Z" />
              <path d="M7 10.5 C8 13.5, 8.5 16, 9 19.5 C9.5 16, 10 13.5, 11 10.5 Z" />
            </g>
            <text
              x="22"
              y="14"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="12.5"
              letterSpacing="0.05em"
            >
              COOPI
            </text>
            <text
              x="22"
              y="20.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="600"
              fontSize="3.8"
              letterSpacing="0.02em"
              opacity="0.82"
            >
              COOPERAZIONE INTERNAZIONALE
            </text>
          </svg>
        }
      />

      {/* 2. FADV (l'Albero della Vita) */}
      <LogoItem
        id="fadv"
        name="FADV"
        fullName="Fondazione L'Albero della Vita"
        customSrc="/logos/fadv.png"
        height="21px"
        maxWidth="54px"
        svgComponent={
          <svg
            viewBox="0 0 54 26"
            height="21"
            fill="currentColor"
            style={{ display: 'block' }}
          >
            <text
              x="1"
              y="14"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="13"
              letterSpacing="0.04em"
            >
              FADV
            </text>
            <line
              x1="1"
              y1="16.5"
              x2="50"
              y2="16.5"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.85"
            />
            <text
              x="1"
              y="21"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="600"
              fontSize="3.5"
              letterSpacing="0.02em"
              opacity="0.82"
            >
              L'ALBERO DELLA VITA
            </text>
          </svg>
        }
      />

      {/* 3. HIAS */}
      <LogoItem
        id="hias"
        name="HIAS"
        fullName="HIAS - Welcome the stranger. Protect the refugee."
        customSrc="/logos/hias.png"
        height="16px"
        maxWidth="46px"
        svgComponent={
          <svg
            viewBox="0 0 46 26"
            height="16"
            fill="currentColor"
            style={{ display: 'block' }}
          >
            <text
              x="0"
              y="17"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="15.5"
              letterSpacing="0.06em"
            >
              HIAS
            </text>
          </svg>
        }
      />

      {/* 4. HI (Humanity & Inclusion) */}
      <LogoItem
        id="hi"
        name="HI"
        fullName="Humanity & Inclusion (HI)"
        customSrc="/logos/hi.png"
        height="19px"
        maxWidth="44px"
        svgComponent={
          <svg
            viewBox="0 0 30 26"
            height="19"
            fill="currentColor"
            style={{ display: 'block' }}
          >
            <text
              x="1"
              y="17"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="17"
              letterSpacing="0.05em"
            >
              HI
            </text>
          </svg>
        }
      />
    </div>
  );
}
