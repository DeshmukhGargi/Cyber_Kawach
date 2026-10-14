import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Info,
  Cpu,
  BookmarkCheck,
  Layers,
} from 'lucide-react';
import { AnalysisResponse } from '../types/cyber.ts';
import { RiskScoreGauge } from './RiskScoreGauge.tsx';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

interface AnalysisResultCardProps {
  result: AnalysisResponse;
  onReset: () => void;
  onSaveToHistory?: () => void;
  isSaved?: boolean;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onReset,
  onSaveToHistory,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const reportText = `[CYBER KAWACH SECURITY VERDICT]
Threat Classification: ${result.category}
Threat Level: ${result.threat_level}
Risk Score: ${result.risk_score} / 100
Scam Vector: ${result.scam_type}

Detected Red Flags:
${result.indicators.map((ind) => `- ${ind}`).join('\n')}

AI Security Breakdown:
${result.explanation}

Recommended Protective Actions:
${result.recommendations.map((rec) => `* ${rec}`).join('\n')}

Verification Advisory:
${result.uncertainty}
---
Analyzed with Cyber Kawach - Click Smart. Stay Safe.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getVerdictTheme = () => {
    switch (result.category) {
      case 'DO NOT TOUCH':
        return {
          bannerBorder: 'border-red-200',
          bannerBg: 'bg-red-50/80',
          textColor: 'text-red-700',
          icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
          title: 'DO NOT TOUCH — CRITICAL FRAUD DETECTED',
        };
      case 'SCAM':
        return {
          bannerBorder: 'border-rose-200',
          bannerBg: 'bg-rose-50/80',
          textColor: 'text-rose-700',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          title: 'SCAM DETECTED — HIGH RISK COMMUNICATION',
        };
      case 'MODERATE':
        return {
          bannerBorder: 'border-amber-200',
          bannerBg: 'bg-amber-50/80',
          textColor: 'text-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          title: 'MODERATE RISK — EXERCISE HEIGHTENED CAUTION',
        };
      case 'SAFE':
      default:
        return {
          bannerBorder: 'border-emerald-200',
          bannerBg: 'bg-emerald-50/80',
          textColor: 'text-emerald-800',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          title: 'VERIFIED LOW RISK — NO MALICIOUS ANOMALIES FOUND',
        };
    }
  };

  const theme = getVerdictTheme();

  return (
    <div className="relative space-y-6 animate-in fade-in-30 duration-300">
      {/* Decorative Cyber Kawach Watermark Behind Results */}
      <div className="absolute right-0 top-1/4 -translate-y-1/2 opacity-[0.035] pointer-events-none hidden md:block">
        <CyberKawachLogo size={420} variant="watermark" />
      </div>

      {/* Top Glassmorphism Verdict Banner */}
      <div className={`p-5 rounded-2xl ${theme.bannerBg} border ${theme.bannerBorder} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm shrink-0">
            {theme.icon}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              Cyber Kawach Security Verdict
            </div>
            <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${theme.textColor}`}>
              {theme.title}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-[#E8F8F5] text-[#183B3A] border-[#DCEBE7]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved in History' : 'Save to History'}</span>
            </button>
          )}

          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-[#E8F8F5] text-[#183B3A] transition-colors flex items-center gap-1.5 border border-[#DCEBE7] shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#526766]" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white transition-colors flex items-center gap-1.5 shadow-xs shadow-[#38BDF8]/25 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Circular Animated Risk Score Gauge */}
      <RiskScoreGauge
        score={result.risk_score}
        category={result.category}
        threatLevel={result.threat_level}
      />

      {/* Separate Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Identified Scam Category & Pattern */}
        <div className="p-6 rounded-2xl bg-white space-y-4 border border-[#DCEBE7] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCEBE7]/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#176B61]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B3A]">
                Scam Category &amp; Vector
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#176B61] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-[#E8F8F5] border border-[#B8F2E6]">
              {result.type}
            </span>
          </div>

          <div className="space-y-1">
            <h5 className="text-base font-bold text-[#183B3A]">
              {result.scam_type}
            </h5>
            <p className="text-xs text-[#526766] leading-relaxed">
              Targeted classification based on syntax patterns, coercion urgency, and communication headers.
            </p>
          </div>

          {/* Card Warning Signs / Red Flags */}
          <div className="pt-2 border-t border-[#DCEBE7]/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Detected Warning Signs ({result.indicators.length})</span>
            </div>

            <ul className="space-y-2">
              {result.indicators.map((ind, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] text-xs text-[#183B3A] flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: AI Security Analysis & Recommended Safety Actions */}
        <div className="p-6 rounded-2xl bg-white space-y-4 border border-[#DCEBE7] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCEBE7]/60">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#176B61]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B3A]">
                AI Fraud Analysis
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#526766] px-2 py-0.5 rounded-lg bg-[#E8F8F5] border border-[#B8F2E6]">
              {result.engine === 'gemini-ai' ? 'Gemini 3.8 Flash' : 'Cyber Kawach Engine'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] text-xs text-[#526766] leading-relaxed">
            &ldquo;{result.explanation}&rdquo;
          </div>

          {/* Recommended Action Checklist */}
          <div className="pt-2 border-t border-[#DCEBE7]/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Protective Actions</span>
            </div>

            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] text-xs text-[#183B3A] flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* URL Structural Inspector Card (when URL analysis is present) */}
      {result.url_details && (
        <div className="p-6 rounded-2xl bg-white space-y-4 border border-[#DCEBE7] shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCEBE7]/60">
            <Globe className="w-4 h-4 text-[#176B61]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B3A]">
              URL Structural &amp; Heuristic Inspection
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7]">
              <div className="text-[10px] text-[#526766] font-mono uppercase">Protocol</div>
              <div className="font-semibold text-[#183B3A] uppercase mt-0.5">
                {result.url_details.protocol}
                {result.url_details.protocol === 'http' && (
                  <span className="ml-1 text-[10px] text-rose-600 font-normal">(Unencrypted)</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7]">
              <div className="text-[10px] text-[#526766] font-mono uppercase">Host Entity</div>
              <div className="font-semibold text-[#183B3A] mt-0.5">
                {result.url_details.is_ip_address ? (
                  <span className="text-rose-600">Raw IP Address</span>
                ) : (
                  <span>Registered Domain</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7]">
              <div className="text-[10px] text-[#526766] font-mono uppercase">Redirection Cloaking</div>
              <div className="font-semibold text-[#183B3A] mt-0.5">
                {result.url_details.has_url_shortener ? (
                  <span className="text-amber-700 font-bold">URL Shortener Used</span>
                ) : (
                  <span className="text-[#526766]">Direct Domain</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7]">
              <div className="text-[10px] text-[#526766] font-mono uppercase">TLD Reputation</div>
              <div className="font-semibold text-[#183B3A] mt-0.5">
                {result.url_details.has_suspicious_tld ? (
                  <span className="text-rose-600 font-bold">High Risk (.{(result.url_details.tld)})</span>
                ) : (
                  <span className="text-emerald-700">Standard (.{(result.url_details.tld || 'com')})</span>
                )}
              </div>
            </div>
          </div>

          {result.url_details.suspicious_keywords_found.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] text-xs">
              <span className="text-[#526766] font-mono text-[11px]">Deceptive Target Keywords:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {result.url_details.suspicious_keywords_found.map((kw, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-semibold">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uncertainty & Limitations Card */}
      <div className="p-4 rounded-xl bg-white border border-[#DCEBE7] flex items-start gap-3 text-xs text-[#526766] leading-relaxed shadow-xs">
        <Info className="w-4 h-4 text-[#176B61] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#183B3A]">Limitations Disclosure: </strong>
          {result.uncertainty}
        </div>
      </div>
    </div>
  );
};
