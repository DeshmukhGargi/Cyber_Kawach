import React from 'react';
import { PhoneCall, ExternalLink } from 'lucide-react';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

interface FooterProps {
  setActivePage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="relative border-t border-[#1F4D4B] bg-[#183B3A] text-[#DCEBE7] overflow-hidden z-10">
      {/* Decorative Watermark */}
      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.035] pointer-events-none hidden md:block">
        <CyberKawachLogo size={480} variant="watermark" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <CyberKawachLogo size={30} variant="brand" glow={true} />
              <span className="tracking-tight text-white font-black">Cyber Kawach</span>
            </div>
            <p className="text-xs text-[#DCEBE7]/80 leading-relaxed font-normal">
              &ldquo;Click Smart. Stay Safe.&rdquo; — An AI-powered scam detection, threat intelligence, and cybersecurity defense platform.
            </p>
            <div className="text-[11px] font-mono text-[#38BDF8]">
              Zero-Trust Architecture &bull; Gemini 3.8 Flash
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-3 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('detection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Scan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('home');
                    setTimeout(() => {
                      const el = document.getElementById('how-it-works');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('scenarios'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Scenarios &amp; Cyber Quiz
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Scan History
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  User Dashboard &amp; Fitness
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Account Sign In / Register
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#38BDF8] transition-colors cursor-pointer text-[#DCEBE7]/80"
                >
                  Architecture &amp; Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-3 font-mono">
              Emergency Reporting
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#122C2B] border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-300 font-semibold mb-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>National Cyber Crime Helpline</span>
                </div>
                <div className="text-lg font-mono font-black text-white tracking-wide">
                  1930
                </div>
                <div className="text-[11px] text-[#DCEBE7]/80 mt-0.5 leading-normal">
                  Immediate 24/7 financial cyber fraud reporting in India.
                </div>
              </div>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:text-[#0EA5E9] transition-colors"
              >
                <span>National Portal: cybercrime.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Advisory Disclaimer */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-3 font-mono">
              Advisory Disclaimer
            </h4>
            <p className="text-xs text-[#DCEBE7]/80 leading-relaxed">
              Cyber Kawach delivers heuristic and AI-assisted fraud assessments for defensive triage and awareness. A low risk score does not guarantee safety, nor does a high score establish legal culpability. Never share passwords or OTPs with unverified third parties.
            </p>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 border-t border-[#1F4D4B] flex flex-col sm:flex-row items-center justify-between text-xs text-[#DCEBE7]/60 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Cyber Kawach &bull; Click Smart. Stay Safe. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#DCEBE7]/60">
            <span>React 19</span>
            <span aria-hidden="true">&middot;</span>
            <span>TypeScript</span>
            <span aria-hidden="true">&middot;</span>
            <span>Tailwind CSS</span>
            <span aria-hidden="true">&middot;</span>
            <span>Zero-Trust API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
