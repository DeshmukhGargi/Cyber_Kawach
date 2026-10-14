import React from 'react';
import {
  Cpu,
  Code2,
  Lock,
  Server,
  FileCheck,
  Layers,
} from 'lucide-react';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative">
      {/* Watermark in About */}
      <div className="absolute top-1/4 right-0 opacity-[0.03] pointer-events-none hidden md:block">
        <CyberKawachLogo size={520} variant="watermark" />
      </div>

      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] font-bold uppercase tracking-wider">
          <CyberKawachLogo size={18} variant="brand" />
          <span>Project Identity &amp; Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#183B3A]">
          About Cyber Kawach
        </h1>
        <p className="text-sm sm:text-base text-[#526766] max-w-2xl leading-relaxed">
          &ldquo;Click Smart. Stay Safe.&rdquo; — An enterprise-grade scam detection and cybersecurity intelligence platform designed for engineering rigor, real-time threat triage, and intuitive digital defense.
        </p>
      </div>

      {/* Core Project Domains */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Artificial Intelligence', icon: Cpu, desc: 'Gemini 3.8 Flash NLP, Semantics & Social Engineering Analysis' },
          { label: 'Cyber Security', icon: Lock, desc: 'Heuristic Scoring, Passive URL Inspection & Phishing Defense' },
          { label: 'Full-Stack Web Dev', icon: Code2, desc: 'React 19, TypeScript, Tailwind CSS, Express & Flask REST API' },
          { label: 'Cloud Architecture', icon: Server, desc: 'Zero-Trust Architecture, RESTful API, Memory-Cached Feeds' },
        ].map((d, i) => {
          const Icon = d.icon;
          return (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#DCEBE7] space-y-2.5 hover:border-[#38BDF8] transition-all shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61]">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#183B3A]">
                {d.label}
              </h3>
              <p className="text-[11px] text-[#526766] leading-relaxed">
                {d.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Technical Architecture Overview */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-[#183B3A]">
          <Layers className="w-5 h-5 text-[#176B61]" />
          <h2 className="text-xl font-bold tracking-tight">
            System Architecture &amp; Data Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#526766]">
          {/* Frontend Tier */}
          <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
            <div className="font-mono text-[#176B61] font-bold uppercase tracking-wider text-[11px]">
              01. Frontend Tier
            </div>
            <h4 className="text-sm font-bold text-[#183B3A]">
              React + Tailwind Cybersecurity UI
            </h4>
            <p className="text-[#526766] leading-relaxed">
              Fresh Mint, Sky Blue &amp; White palette, Cyber Kawach shield logo watermarks, multi-modal scanner, animated circular risk gauges, audit scan history, and real-time threat evaluation.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#526766] border-t border-[#DCEBE7]">
              Stack: React 19 &bull; Tailwind CSS &bull; Lucide React
            </div>
          </div>

          {/* Backend & Security Tier */}
          <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
            <div className="font-mono text-[#176B61] font-bold uppercase tracking-wider text-[11px]">
              02. Backend REST API
            </div>
            <h4 className="text-sm font-bold text-[#183B3A]">
              Express &amp; Python Flask
            </h4>
            <p className="text-[#526766] leading-relaxed">
              Enforces zero-trust isolation on untrusted user input, calculates structural heuristics (IP checking, shorteners, TLD risks), and caches live threat intelligence feeds.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#526766] border-t border-[#DCEBE7]">
              Endpoints: POST /api/analyze &bull; GET /api/threat-intelligence
            </div>
          </div>

          {/* AI Intelligence Tier */}
          <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
            <div className="font-mono text-[#176B61] font-bold uppercase tracking-wider text-[11px]">
              03. AI Intelligence Tier
            </div>
            <h4 className="text-sm font-bold text-[#183B3A]">
              Google Gemini 3.8 Flash
            </h4>
            <p className="text-[#526766] leading-relaxed">
              Evaluates contextual coercion, banking impersonation, and social engineering psychology against real-world scam vectors with automatic heuristic fallback.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#526766] border-t border-[#DCEBE7]">
              Model: gemini-3.8-flash &bull; Fallback: Rule Engine
            </div>
          </div>
        </div>
      </section>

      {/* Risk Calibration Framework */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-[#183B3A] tracking-tight">
          Calibrated Risk Scoring Framework
        </h2>
        <p className="text-xs text-[#526766] leading-relaxed">
          Cyber Kawach categorizes threat probability into four distinct calibrated tiers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs pt-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
            <div className="font-mono font-black text-lg text-[#22C55E]">0 – 25</div>
            <div className="font-bold text-[#183B3A]">SAFE</div>
            <div className="text-[11px] text-[#526766]">No significant scam or phishing indicators detected.</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="font-mono font-black text-lg text-[#F59E0B]">26 – 50</div>
            <div className="font-bold text-[#183B3A]">MODERATE</div>
            <div className="text-[11px] text-[#526766]">Some unsolicited or suspicious characteristics present.</div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <div className="font-mono font-black text-lg text-[#EF4444]">51 – 80</div>
            <div className="font-bold text-[#183B3A]">SCAM</div>
            <div className="text-[11px] text-[#526766]">Strong indicators of phishing, fake jobs, or fraud.</div>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
            <div className="font-mono font-black text-lg text-[#B91C1C]">81 – 100</div>
            <div className="font-bold text-[#183B3A]">DO NOT TOUCH</div>
            <div className="text-[11px] text-[#526766]">Extremely high-risk malicious vector. Immediate danger.</div>
          </div>
        </div>
      </section>

      {/* Academic Project & Flask Backend Source Code */}
      <section className="p-6 rounded-2xl bg-white border border-[#DCEBE7] text-xs text-[#526766] space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-[#183B3A] flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#176B61]" />
          <span>Academic Project &amp; Flask Backend Source Code</span>
        </h3>
        <p className="leading-relaxed">
          The complete standalone Python Flask backend source code is provided in the repository under <code className="px-1.5 py-0.5 rounded bg-[#E8F8F5] text-[#176B61] font-mono text-[11px]">/backend</code> with modular modules (<code className="font-mono text-[#183B3A]">app.py</code>, <code className="font-mono text-[#183B3A]">validators.py</code>, <code className="font-mono text-[#183B3A]">rules.py</code>, <code className="font-mono text-[#183B3A]">url_analyzer.py</code>, <code className="font-mono text-[#183B3A]">risk_engine.py</code>, <code className="font-mono text-[#183B3A]">ai_analyzer.py</code>) and <code className="font-mono text-[#183B3A]">README.md</code> for immediate local and server deployment.
        </p>
      </section>
    </div>
  );
};
