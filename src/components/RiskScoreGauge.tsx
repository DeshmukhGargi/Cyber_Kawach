import React from 'react';
import { RiskCategory, ThreatLevel } from '../types/cyber.ts';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number;
  category: RiskCategory;
  threatLevel: ThreatLevel;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  category,
  threatLevel,
}) => {
  const radius = 62;
  const stroke = 9;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Distinct visual indicators per prompt:
  // SAFE: #22C55E, MODERATE: #F59E0B, SCAM: #EF4444, DO NOT TOUCH: #B91C1C
  let strokeColor = '#22C55E'; // Green (SAFE)
  let textColor = 'text-emerald-700';
  let glowColor = 'rgba(34, 197, 94, 0.2)';
  let bgBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let Icon = ShieldCheck;
  let statusText = 'Low Risk. Content exhibits standard legitimate patterns.';

  if (category === 'MODERATE') {
    strokeColor = '#F59E0B'; // Amber
    textColor = 'text-amber-700';
    glowColor = 'rgba(245, 158, 11, 0.2)';
    bgBadge = 'bg-amber-50 text-amber-900 border-amber-200';
    Icon = AlertTriangle;
    statusText = 'Medium Risk. Suspicious or unsolicited elements detected.';
  } else if (category === 'SCAM') {
    strokeColor = '#EF4444'; // Red
    textColor = 'text-rose-700';
    glowColor = 'rgba(239, 68, 68, 0.2)';
    bgBadge = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = ShieldAlert;
    statusText = 'High Risk. Strong phishing or social engineering markers detected.';
  } else if (category === 'DO NOT TOUCH') {
    strokeColor = '#B91C1C'; // Deep Red
    textColor = 'text-red-700';
    glowColor = 'rgba(185, 28, 28, 0.25)';
    bgBadge = 'bg-red-50 text-red-900 border-red-300';
    Icon = ShieldX;
    statusText = 'CRITICAL DANGER! Severe credential theft or financial extortion attempt.';
  }

  return (
    <div className="relative p-6 sm:p-7 rounded-2xl bg-white shadow-xs overflow-hidden border border-[#DCEBE7]">
      {/* Background Soft Glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: glowColor }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Animated Cyber Circular Ring Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Outer Track */}
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Soft Glow Underlay */}
            <circle
              stroke={strokeColor}
              fill="transparent"
              strokeWidth={stroke + 3}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: 0.25,
                filter: 'blur(3px)',
              }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Active Gauge Fill Track */}
            <circle
              stroke={strokeColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          {/* Central Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${textColor} tabular-nums`}>
              {score}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5">
              Score / 100
            </span>
          </div>
        </div>

        {/* Narrative & Metric Cards */}
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase border flex items-center gap-1.5 ${bgBadge}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{category}</span>
            </span>

            <span className="text-xs font-mono text-slate-500">
              Threat Severity: <strong className="text-slate-800 font-semibold">{threatLevel}</strong>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
            {statusText}
          </p>

          {/* Calibrated Threshold Indicator Scale */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center sm:justify-start gap-3 text-[11px] font-mono text-slate-500">
            <span className={score <= 25 ? 'text-emerald-700 font-bold' : ''}>0–25 Safe</span>
            <span aria-hidden="true">&middot;</span>
            <span className={score > 25 && score <= 50 ? 'text-amber-700 font-bold' : ''}>26–50 Moderate</span>
            <span aria-hidden="true">&middot;</span>
            <span className={score > 50 && score <= 80 ? 'text-rose-700 font-bold' : ''}>51–80 Scam</span>
            <span aria-hidden="true">&middot;</span>
            <span className={score > 80 ? 'text-red-700 font-bold' : ''}>81–100 Do Not Touch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
