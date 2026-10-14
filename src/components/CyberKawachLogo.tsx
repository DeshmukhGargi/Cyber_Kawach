import React from 'react';

interface CyberKawachLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'brand' | 'watermark' | 'glowing' | 'minimal';
  glow?: boolean;
}

export const CyberKawachLogo: React.FC<CyberKawachLogoProps> = ({
  className = '',
  size = 40,
  variant = 'brand',
  glow = false,
}) => {
  const isWatermark = variant === 'watermark';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Soft Glow Aura in Sky Blue & Mint */}
      {(glow || isWatermark || variant === 'glowing') && (
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-opacity duration-700"
          style={{
            background: isWatermark
              ? 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(23,107,97,0.06) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.28) 0%, rgba(184,242,230,0.2) 60%, transparent 80%)',
            transform: 'scale(1.4)',
          }}
        />
      )}

      {/* High-Fidelity SVG Cyber Kawach Shield Emblem */}
      <svg
        viewBox="0 0 120 136"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300"
      >
        <defs>
          {/* Main Shield Gradient: Sky Blue to Dark Teal */}
          <linearGradient id="shieldGrad" x1="12" y1="8" x2="108" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#176B61" />
            <stop offset="100%" stopColor="#183B3A" />
          </linearGradient>

          {/* Border Stroke Gradient */}
          <linearGradient id="shieldBorder" x1="60" y1="4" x2="60" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#176B61" />
            <stop offset="100%" stopColor="#183B3A" stopOpacity="0.8" />
          </linearGradient>

          {/* Core Crest Radial Gradient */}
          <radialGradient id="coreGlow" cx="60" cy="62" r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#176B61" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#183B3A" stopOpacity="0" />
          </radialGradient>

          {/* Accent Sky Blue to Teal Energy Line */}
          <linearGradient id="energyLine" x1="30" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#176B61" />
          </linearGradient>

          {/* Soft Filter Glow */}
          <filter id="cyberGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Outline */}
        <path
          d="M60 6 L106 24 C106 68 88 106 60 130 C32 106 14 68 14 24 Z"
          fill="url(#shieldGrad)"
          fillOpacity={isWatermark ? '0.12' : '0.24'}
          stroke="url(#shieldBorder)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Geometric Shield Facet */}
        <path
          d="M60 16 L96 32 C96 66 82 98 60 118 C38 98 24 66 24 32 Z"
          fill="#183B3A"
          fillOpacity={isWatermark ? '0.1' : '0.55'}
          stroke="#38BDF8"
          strokeOpacity={isWatermark ? '0.3' : '0.8'}
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />

        {/* Angular Geometric Chevron Layers (Kawach Armor Plates) */}
        <path
          d="M60 28 L86 42 L60 56 L34 42 Z"
          fill="none"
          stroke="url(#energyLine)"
          strokeWidth="1.8"
        />

        {/* Center Kawach Core Node with Pulse Glow */}
        <circle
          cx="60"
          cy="66"
          r="16"
          fill="url(#coreGlow)"
        />
        <circle
          cx="60"
          cy="66"
          r="10"
          fill="#176B61"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />

        {/* Center Security Lock / Keyhole Geometry */}
        <path
          d="M57 62 C57 60.3 58.3 59 60 59 C61.7 59 63 60.3 63 62 C63 63.3 62.2 64.3 61 64.7 L61.5 71 L58.5 71 L59 64.7 C57.8 64.3 57 63.3 57 62 Z"
          fill="#38BDF8"
        />

        {/* Circuit Interconnect Traces (Right & Left Wings) */}
        <path
          d="M60 82 L60 102 M45 74 L32 86 M75 74 L88 86"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Circuit Micro-Terminal Nodes */}
        <circle cx="32" cy="86" r="2.2" fill="#38BDF8" filter="url(#cyberGlowFilter)" />
        <circle cx="88" cy="86" r="2.2" fill="#38BDF8" filter="url(#cyberGlowFilter)" />
        <circle cx="60" cy="102" r="2.5" fill="#38BDF8" filter="url(#cyberGlowFilter)" />

        {/* Top Decorative Notch Accent */}
        <path
          d="M52 10 L60 6 L68 10"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
