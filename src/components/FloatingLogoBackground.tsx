import React, { useEffect, useState } from 'react';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

export const FloatingLogoBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse offset (-1 to 1) for subtle parallax
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none"
    >
      {/* Background Cyber Ambient Lights in Fresh Mint & Sky Blue */}
      <div
        className="absolute -top-[15%] right-[-10%] w-[580px] h-[580px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, #B8F2E6 60%, transparent 75%)',
          transform: `translate(${mousePos.x * 14}px, ${mousePos.y * 14}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      />

      <div
        className="absolute top-[45%] -left-[15%] w-[620px] h-[620px] rounded-full blur-[160px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #B8F2E6 0%, #38BDF8 60%, transparent 75%)',
          transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -16}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      />

      <div
        className="absolute -bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, #B8F2E6 60%, transparent 75%)',
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      />

      {/* Floating Logo 1: Top-Right (Large Watermark behind Hero & Scanner Area) */}
      <div
        className="absolute top-[4%] right-[2%] md:right-[6%] opacity-[0.065] transition-opacity duration-1000 hidden sm:block animate-float-slow"
        style={{
          transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 18}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <CyberKawachLogo
          size={520}
          variant="watermark"
          glow={true}
        />
      </div>

      {/* Floating Logo 2: Mid-Left (Floating Drift Watermark) */}
      <div
        className="absolute top-[42%] -left-[6%] md:left-[2%] opacity-[0.05] transition-opacity duration-1000 hidden md:block animate-float-reverse"
        style={{
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <CyberKawachLogo
          size={440}
          variant="watermark"
          glow={true}
        />
      </div>

      {/* Floating Logo 3: Bottom-Right (Dashboard & Tips Watermark) */}
      <div
        className="absolute bottom-[8%] right-[8%] opacity-[0.055] transition-opacity duration-1000 hidden lg:block animate-float-drift"
        style={{
          transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <CyberKawachLogo
          size={390}
          variant="watermark"
          glow={true}
        />
      </div>

      {/* Subtle Mobile Watermark */}
      <div className="absolute top-[18%] right-[-15%] opacity-[0.05] sm:hidden animate-float-slow">
        <CyberKawachLogo
          size={300}
          variant="watermark"
          glow={false}
        />
      </div>

      {/* Cyber Circuit Network Subtle Line Grid */}
      <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
    </div>
  );
};
