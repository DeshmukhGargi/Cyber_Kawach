import React from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Activity,
  ArrowRight,
  BookOpen,
  PhoneCall,
  Sparkles,
  Globe,
  History,
} from 'lucide-react';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';
import { ContentType, QuizDomain } from '../types/cyber.ts';
import { TheThreatLandscape } from '../components/TheThreatLandscape.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: { type?: ContentType; content?: string; subject?: string }) => void;
  scanCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const quickTestCases = [
    {
      title: 'Electricity Power Cutoff',
      type: 'sms' as ContentType,
      category: 'SCAM',
      preview: 'Electricity power will be disconnected tonight at 9:30 PM from substation. Call 8920194821 immediately.',
      fullText: 'Dear consumer, your electricity power connection will be disconnected tonight at 9:30 PM from the sub-station because your previous month bill was not updated. Immediately call electricity officer 8920194821 or pay ₹15 update fee at http://bit.ly/power-bill-update to prevent blackouts. - Bijli Vibhag',
    },
    {
      title: 'Fake YouTube Like Job',
      type: 'whatsapp' as ContentType,
      category: 'SCAM',
      preview: 'Earn ₹1500–₹4500 daily by simply liking YouTube videos. Work from phone. Instant UPI payout.',
      fullText: 'Hello! I am Priya from Global Media Recruitment. Like 3 YouTube videos per batch and earn ₹1,500 to ₹4,500 daily directly in your UPI account. Join our official Telegram coordinator to claim ₹500 welcome bonus: https://t.me/GlobalTask_Manager_Official',
    },
    {
      title: 'NetBanking Freeze Warning',
      type: 'email' as ContentType,
      category: 'DO NOT TOUCH',
      preview: 'Unauthorized login detected from Moscow. NetBanking suspended. Verify KYC within 2 hours.',
      fullText: 'Dear Customer, Unauthorized login detected from Moscow. Your NetBanking and debit card access has been suspended. Please verify your credentials immediately at http://secure-bank-login-update.click/portal/auth within 2 hours to avoid permanent deactivation.',
    },
  ];

  return (
    <div className="space-y-20 pb-20 relative">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-24 pb-16 overflow-hidden">
        {/* Large Decorative Cyber Kawach Watermark in Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none z-0 hidden sm:block animate-float-slow">
          <CyberKawachLogo size={580} variant="watermark" glow={true} />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[360px] bg-gradient-to-tr from-[#B8F2E6]/25 via-[#38BDF8]/15 to-[#B8F2E6]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Logo Badge & Tagline per Prompt */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#DCEBE7] text-xs font-semibold text-[#183B3A] shadow-xs">
            <CyberKawachLogo size={22} variant="brand" glow={true} />
            <span className="text-[#176B61] tracking-wide uppercase font-mono text-[11px] font-bold">
              Cyber Kawach
            </span>
            <span aria-hidden="true" className="text-slate-300">&bull;</span>
            <span className="text-[#526766] font-medium">
              Click Smart. Stay Safe.
            </span>
          </div>

          {/* Large Heading */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#183B3A] max-w-4xl mx-auto leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            Stay One Step Ahead of <span className="bg-gradient-to-r from-[#183B3A] via-[#176B61] to-[#38BDF8] bg-clip-text text-transparent">Cyber Fraud</span>.
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-[#526766] max-w-2xl mx-auto leading-relaxed font-normal">
            Suspicious SMS, WhatsApp message, email, or urgent banking alert? Paste it below to analyze social engineering tactics, credential theft, fake lottery claims, and malicious URLs in seconds.
          </p>

          {/* Floating Security-Themed Visual Elements Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-[#526766]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCEBE7] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#176B61]" />
              <span>Zero-Trust Inspection</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCEBE7] shadow-xs">
              <Lock className="w-3.5 h-3.5 text-[#176B61]" />
              <span>Credential Defense</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCEBE7] shadow-xs">
              <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Real-Time Intelligence</span>
            </div>
          </div>

          {/* Prominent Glowing "Scan" Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('detection')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md shadow-[#38BDF8]/25 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('scenarios')}
              className="w-full sm:w-auto px-7 py-4 text-sm font-semibold text-[#183B3A] bg-white hover:bg-[#E8F8F5] rounded-xl transition-all flex items-center justify-center gap-2 border border-[#DCEBE7] shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#176B61]" />
              <span>Scenarios &amp; Cyber Quiz</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Cyber Crime Helpline Banner - Soft Mint Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-[#B8F2E6] border border-[#A2E8D9] text-[#183B3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-white text-[#176B61] shrink-0 border border-[#A2E8D9] shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#176B61] font-bold">
                Facing Financial Cyber Fraud Right Now?
              </div>
              <div className="text-sm font-bold text-[#183B3A] mt-0.5">
                Dial National Cyber Crime Helpline <span className="text-[#176B61] font-mono text-base font-extrabold">1930</span> or visit <span className="underline decoration-[#176B61] font-semibold">cybercrime.gov.in</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('scenarios')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white transition-colors whitespace-nowrap self-stretch sm:self-center text-center cursor-pointer shadow-xs"
          >
            Practice Scenarios
          </button>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#176B61] font-bold">
            <CyberKawachLogo size={16} variant="brand" />
            <span>Inspection Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#183B3A]">
            How Cyber Kawach Works
          </h2>
          <p className="text-xs sm:text-sm text-[#526766] max-w-2xl mx-auto leading-relaxed">
            From unverified incoming message to definitive cybersecurity verdict in four automated stages.
          </p>
        </div>

        {/* 4 Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-4 relative group shadow-xs hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#176B61]">
                01
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-semibold">
                Payload Ingestion
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#183B3A] group-hover:text-[#176B61] transition-colors">
                Input Isolation &amp; Sanitization
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Paste any SMS, WhatsApp forward, phishing email, or web link. The engine safely isolates the raw text in a sandboxed client parser without executing embedded scripts or visiting links.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-4 relative group shadow-xs hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#176B61]">
                02
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-semibold">
                Heuristic Scanning
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#183B3A] group-hover:text-[#176B61] transition-colors">
                Rule-Based Red Flag Extraction
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Instant signature checks extract suspicious TLDs (.xyz, .top, .click), raw IP domain addresses, artificial countdown timers, fake official bank codes, and deceptive UPI PIN requests.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-4 relative group shadow-xs hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#176B61]">
                03
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-semibold">
                Gemini AI Engine
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#183B3A] group-hover:text-[#176B61] transition-colors">
                AI Psychological Analysis
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Google Gemini AI reasons through emotional manipulation (fear, greed, authority, panic), detects zero-day phishing narratives, and compares the payload against known fraud syndicates.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-4 relative group shadow-xs hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#176B61]">
                04
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-semibold">
                Actionable Defense
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#183B3A] group-hover:text-[#176B61] transition-colors">
                Risk Score &amp; Protection Plan
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Receive an animated 0–100 risk score, clear classification (Safe, Moderate, Scam), itemized red flags, safe alternative actions, and immediate 1930 helpline filing guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 1: THE CYBER THREAT LANDSCAPE SECTION */}
      <TheThreatLandscape
        onTestDomain={(dom) => {
          onNavigate('scenarios', {
            type: dom === 'payment' ? 'whatsapp' : (dom as ContentType),
          });
        }}
      />

      {/* Core Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#176B61] font-bold">
            Intelligent Defense Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B3A]">
            Cyber Threat Detection Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#526766] max-w-xl mx-auto">
            Engineered to evaluate linguistic deception, urgency pressure, and technical manipulation across all communication vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Scan */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61]">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#183B3A]">
                Scan
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Scan suspicious emails, WhatsApp forwards, and SMS for urgency threats, account freezes, and fake bank warnings.
              </p>
            </div>
            <button
              onClick={() => onNavigate('detection', { type: 'email' })}
              className="text-xs font-bold text-[#176B61] hover:text-[#38BDF8] flex items-center gap-1.5 pt-2 cursor-pointer transition-colors"
            >
              <span>Scan Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: URL Safety Inspector */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#183B3A]">
                URL Safety Inspector
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Dissect links without opening them: inspect raw IP addresses, high-risk TLDs, cloaked URL shorteners, and deceptive keywords.
              </p>
            </div>
            <button
              onClick={() => onNavigate('detection', { type: 'url' })}
              className="text-xs font-bold text-[#176B61] hover:text-[#38BDF8] flex items-center gap-1.5 pt-2 cursor-pointer transition-colors"
            >
              <span>Inspect Links</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Scenarios & Cyber Quiz */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#183B3A]">
                Scenarios &amp; Cyber Quiz
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Experience simulated attack scenarios and test your instincts with interactive fraud detection quizzes and score rankings.
              </p>
            </div>
            <button
              onClick={() => onNavigate('scenarios')}
              className="text-xs font-bold text-[#176B61] hover:text-[#38BDF8] flex items-center gap-1.5 pt-2 cursor-pointer transition-colors"
            >
              <span>Start Scenarios &amp; Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Scan History & Records */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] transition-all space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61]">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#183B3A]">
                Scan History &amp; Audits
              </h3>
              <p className="text-xs text-[#526766] leading-relaxed">
                Review past evaluated messages, filter by threat severity, compare fraud indicators, and export verification logs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-[#176B61] hover:text-[#38BDF8] flex items-center gap-1.5 pt-2 cursor-pointer transition-colors"
            >
              <span>Open Scan History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Test Samples Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] space-y-5 relative overflow-hidden shadow-xs">
          {/* Watermark in Scanner Preview Box */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.025] pointer-events-none hidden sm:block">
            <CyberKawachLogo size={280} variant="watermark" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCEBE7]/60">
            <div>
              <h3 className="text-base font-bold text-[#183B3A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <span>Test Real Scam Scenarios with 1-Click</span>
              </h3>
              <p className="text-xs text-[#526766]">
                Select an authentic scam sample below to launch the scanner with pre-filled threat payload:
              </p>
            </div>
            <button
              onClick={() => onNavigate('detection')}
              className="text-xs text-[#176B61] hover:text-[#38BDF8] font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors"
            >
              <span>Open Blank Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {quickTestCases.map((tc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] hover:border-[#38BDF8] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="uppercase text-[#176B61] font-bold">{tc.type}</span>
                    <span className="text-[#EF4444] font-semibold">{tc.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#183B3A]">
                    {tc.title}
                  </h4>
                  <p className="text-[11px] text-[#526766] line-clamp-2">
                    {tc.preview}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('detection', { type: tc.type, content: tc.fullText })}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white hover:bg-[#E8F8F5] text-[#176B61] hover:text-[#183B3A] border border-[#DCEBE7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Test in Scanner</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner - Soft Mint Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#B8F2E6] border border-[#A2E8D9] text-center space-y-6 relative overflow-hidden shadow-sm">
          <CyberKawachLogo size={52} variant="brand" glow={true} className="mx-auto" />

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#183B3A] tracking-tight">
              Ready to Verify a Suspicious Communication?
            </h3>
            <p className="text-xs sm:text-sm text-[#526766] leading-relaxed">
              Never share passwords, OTPs, or scan unknown QR codes. Test the message in Cyber Kawach before taking action.
            </p>
          </div>

          <div>
            <button
              onClick={() => onNavigate('detection')}
              className="px-8 py-3.5 text-sm font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl shadow-md shadow-[#38BDF8]/25 inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Launch Message Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
