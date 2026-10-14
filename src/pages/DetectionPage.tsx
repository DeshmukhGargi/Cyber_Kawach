import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Sparkles,
  Send,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { analyzeContent } from '../services/api.ts';
import { saveScanToHistory } from '../services/historyStorage.ts';
import { saveScanToFirestore } from '../services/firestoreScanService.ts';
import { AnalysisResponse, ContentType } from '../types/cyber.ts';
import { AnalysisResultCard } from '../components/AnalysisResultCard.tsx';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DetectionPageProps {
  initialType?: ContentType;
  initialContent?: string;
  initialSubject?: string;
  onScanCompleted?: () => void;
}

const SAMPLE_PRESETS: Record<ContentType, { label: string; content: string; subject?: string; sender?: string }> = {
  email: {
    label: 'Load Phishing Bank Email Sample',
    content: `Dear Valued Customer,\n\nWe detected unauthorized login attempts on your NetBanking portal from an unrecognized device in Moscow, Russia. To protect your funds, your debit card and account access have been temporarily suspended.\n\nYou are urgently requested to verify your identity and restore access within 2 hours by logging into our secured verification gateway: http://secure-bank-login-update.click/portal/auth\n\nFailure to verify will lead to permanent deactivation of your account and levy of a restoration penalty.\n\nWarm regards,\nState Bank Fraud Prevention Cell`,
    subject: 'URGENT: Your NetBanking access suspended - Immediate verification required',
    sender: 'security-alerts@sbi-support-desk.com',
  },
  whatsapp: {
    label: 'Load Fake Job / Task Scam Sample',
    content: `Hello! 👋 I am Priya from Global Media Recruitment. We reviewed your profile on LinkedIn and selected you for our Part-Time Digital Assessor position.\n\nWork from mobile anywhere: Just like and subscribe to 3 YouTube videos per batch and earn ₹1,500 to ₹4,500 daily directly in your UPI account!\n\nNo experience needed. Instant payout guaranteed. Join our official Telegram coordinator right now to claim your ₹500 welcome bonus: https://t.me/GlobalTask_Manager_Official`,
    sender: '+91 98210 54912',
  },
  sms: {
    label: 'Load Smishing Electricity Notice Sample',
    content: `Dear consumer, your electricity power connection will be disconnected tonight at 9:30 PM from the sub-station because your previous month bill was not updated. Immediately call electricity officer 8920194821 or pay ₹15 update fee at http://bit.ly/power-bill-update to prevent blackouts. - Bijli Vibhag`,
    sender: 'VM-BIJLI',
  },
  url: {
    label: 'Load Malicious KYC Phishing URL Sample',
    content: `http://192.168.1.105:8080/sbi-pan-kyc-update.xyz/login.php?ref=urgent_sms`,
  },
};

export const DetectionPage: React.FC<DetectionPageProps> = ({
  initialType = 'email',
  initialContent = '',
  initialSubject = '',
  onScanCompleted,
}) => {
  const { user, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState<ContentType>(initialType);
  const [content, setContent] = useState<string>(initialContent);
  const [subject, setSubject] = useState<string>(initialSubject);
  const [sender, setSender] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const tabs = [
    { id: 'email' as ContentType, label: 'Email Scanner', icon: Mail, desc: 'Analyze spoofed emails, bank suspensions & credential-harvesting attacks' },
    { id: 'whatsapp' as ContentType, label: 'WhatsApp Scanner', icon: MessageSquare, desc: 'Scan fraudulent forwards, fake jobs, Telegram tasks & urgent KYC threats' },
    { id: 'sms' as ContentType, label: 'SMS Smishing', icon: Smartphone, desc: 'Inspect electricity cutoff texts, lottery messages & delivery fee SMS' },
    { id: 'url' as ContentType, label: 'URL Safety Inspector', icon: Globe, desc: 'Dissect links for IP addresses, suspicious TLDs, shorteners & deception' },
  ];

  const handleTabChange = (tabId: ContentType) => {
    setActiveTab(tabId);
    setError(null);
  };

  const handleLoadSample = () => {
    const preset = SAMPLE_PRESETS[activeTab];
    setContent(preset.content);
    if (preset.subject) setSubject(preset.subject);
    if (preset.sender) setSender(preset.sender);
    setError(null);
  };

  const handleClear = () => {
    setContent('');
    setSubject('');
    setSender('');
    setError(null);
    setResult(null);
    setIsSaved(false);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double-scan / concurrent scan execution
    if (loading) return;

    if (!content.trim()) {
      setError('Please enter or paste content to analyze.');
      return;
    }

    if (activeTab === 'url') {
      const cleanUrl = content.trim();
      if (!cleanUrl.includes('.') || cleanUrl.length < 4) {
        setError('Please enter a valid website address or URL format.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    // Multi-stage scan progression feedback
    setScanStep('Deconstructing message payload & isolating untrusted input...');
    const t1 = setTimeout(() => setScanStep('Evaluating heuristic indicators & URL structure...'), 500);
    const t2 = setTimeout(() => setScanStep('Synthesizing threat mechanics via AI & rule engines...'), 1100);

    try {
      const response = await analyzeContent(activeTab, content, subject, sender);
      setResult(response);

      // Save to Firestore if authenticated user
      if (user) {
        try {
          await saveScanToFirestore(user.uid, response, content, subject, sender);
        } catch (fErr) {
          console.warn('Could not persist scan to Firestore:', fErr);
        }
      }

      // Always save to local scan history as well
      saveScanToHistory(response, content, subject, sender);
      setIsSaved(true);
      if (onScanCompleted) onScanCompleted();

      // Scroll to results view smoothly
      setTimeout(() => {
        const el = document.getElementById('results-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Unable to complete security analysis. Please verify connection.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setLoading(false);
      setScanStep('');
    }
  };

  const handleManualSave = async () => {
    if (result && !isSaved) {
      if (user) {
        try {
          await saveScanToFirestore(user.uid, result, content, subject, sender);
        } catch (err) {
          console.warn('Manual Firestore save error:', err);
        }
      }
      saveScanToHistory(result, content, subject, sender);
      setIsSaved(true);
      if (onScanCompleted) onScanCompleted();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Background Watermark Behind Scanner Area */}
      <div className="absolute top-1/4 right-0 translate-x-1/4 opacity-[0.03] pointer-events-none hidden lg:block animate-float-slow">
        <CyberKawachLogo size={550} variant="watermark" />
      </div>

      {/* Page Title & Context */}
      <div className="space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] font-bold uppercase tracking-wider">
          <CyberKawachLogo size={18} variant="brand" />
          <span>Cyber Threat Engine</span>
        </div>

        {/* Shield icon beside the scanner heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#183B3A] flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-[#38BDF8] shrink-0" />
          <span>Scan</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#526766] max-w-2xl leading-relaxed">
          Paste any unsolicited message, suspicious WhatsApp forward, bank SMS, or unknown link. Cyber Kawach isolates the payload, evaluates social engineering tactics, and provides an instant risk rating.
        </p>

        {/* Guest user notice banner */}
        {!user && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#E8F8F5] border border-[#DCEBE7] text-xs text-[#183B3A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              <span>Scanning in Guest mode.</span>
              <button
                type="button"
                onClick={openLoginModal}
                className="text-[#176B61] hover:text-[#183B3A] font-bold underline inline-flex items-center gap-1 cursor-pointer ml-1"
              >
                <LogIn className="w-3 h-3 text-[#176B61]" />
                <span>Sign in to save your scan history</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs relative z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                isActive
                  ? 'bg-[#38BDF8] text-white shadow-md shadow-[#38BDF8]/25'
                  : 'text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Glassmorphism Scanner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs relative z-10 space-y-6 overflow-hidden">
        {/* Subtle Watermark inside Scanner Box */}
        <div className="absolute right-4 bottom-4 opacity-[0.025] pointer-events-none hidden md:block">
          <CyberKawachLogo size={320} variant="watermark" />
        </div>

        {/* Scanner Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCEBE7]/60">
          <div className="text-xs text-[#526766] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>{tabs.find((t) => t.id === activeTab)?.desc}</span>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="self-start sm:self-auto text-xs font-bold text-[#176B61] hover:text-[#38BDF8] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{SAMPLE_PRESETS[activeTab].label}</span>
          </button>
        </div>

        {/* URL Deep Inspection Note */}
        {activeTab === 'url' && (
          <div className="p-4 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] text-xs text-[#176B61] flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#176B61] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Passive URL Heuristic Sandbox:</strong> Cyber Kawach inspects host syntax, raw IP destinations, top-level domain reputation, and URL shortener chains without executing malicious client-side code in your browser.
            </div>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-5">
          {/* Email Subject / Sender Row */}
          {activeTab === 'email' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#183B3A] mb-1.5">
                  Email Subject Line <span className="text-[#526766] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., URGENT: Your NetBanking access suspended"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DCEBE7] text-xs text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183B3A] mb-1.5">
                  Sender Claim or Address <span className="text-[#526766] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g., alerts@bank-support.net"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DCEBE7] text-xs text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20"
                />
              </div>
            </div>
          )}

          {/* WhatsApp / SMS Sender ID */}
          {(activeTab === 'whatsapp' || activeTab === 'sms') && (
            <div>
              <label className="block text-xs font-semibold text-[#183B3A] mb-1.5">
                {activeTab === 'whatsapp' ? 'Sender Phone Number or Group Name' : 'SMS Header / Sender Code'}{' '}
                <span className="text-[#526766] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder={activeTab === 'whatsapp' ? 'e.g., +91 98210 55419 or "SBI Support Team"' : 'e.g., VK-SBIBNK or +91 93392 81042'}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DCEBE7] text-xs text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20"
              />
            </div>
          )}

          {/* Main Message Textarea / Input with Character Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183B3A]">
                {activeTab === 'url' ? 'Suspicious Web Link / Domain' : 'Suspicious Message Content'}
              </label>

              {/* Character counter */}
              <span className="font-mono text-[11px] text-[#526766] tabular-nums">
                {content.length} / 10,000 characters
              </span>
            </div>

            {activeTab === 'url' ? (
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your suspicious URL here (e.g., http://sbi-kyc-verify-portal.click/login)"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-[#DCEBE7] text-sm text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 font-mono transition-all"
              />
            ) : (
              <div className="relative">
                <textarea
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your suspicious message here..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-[#DCEBE7] text-sm text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 leading-relaxed font-sans transition-all resize-y"
                />

                {/* Laser Scanning Animation Overlay during analysis */}
                {loading && (
                  <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent animate-scanline shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!content && !subject && !sender)}
              className="px-4 py-2.5 text-xs font-semibold text-[#526766] hover:text-[#183B3A] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Inputs</span>
            </button>

            {/* Animated Scan Button: Sky Blue main brand accent */}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-8 py-3.5 text-xs font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl transition-all shadow-md shadow-[#38BDF8]/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Threat Vector...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Scan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Smooth Scanning Animation Feedback */}
        {loading && (
          <div className="p-5 rounded-2xl bg-[#E8F8F5] border border-[#DCEBE7] space-y-3 animate-in fade-in-20 duration-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CyberKawachLogo size={28} variant="brand" glow={true} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38BDF8] rounded-full animate-ping" />
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#183B3A] flex items-center gap-2">
                  <span>Executing Cyber Kawach Threat Analysis</span>
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                </span>
                <p className="text-[11px] font-mono text-[#176B61]">
                  {scanStep || 'Inspecting communication structure...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stay Aware, Stay Safe Tip Box (Showcase Reference) */}
        <div className="p-4 rounded-2xl bg-[#B8F2E6]/50 border border-[#A2E8D9] flex items-center gap-3.5 text-xs text-[#183B3A]">
          <div className="w-8 h-8 rounded-xl bg-white text-[#176B61] flex items-center justify-center shrink-0 border border-[#A2E8D9]">
            <ShieldCheck className="w-4 h-4 text-[#176B61]" />
          </div>
          <div>
            <div className="font-bold text-[#183B3A]">Stay Aware, Stay Safe</div>
            <div className="text-[11px] text-[#526766] mt-0.5">
              Our AI uses advanced analysis to detect phishing, fraud, and cyber threats in real-time.
            </div>
          </div>
        </div>
      </div>

      {/* Scan Result Display */}
      {result && (
        <div id="results-view" className="scroll-mt-24">
          <AnalysisResultCard
            result={result}
            onReset={handleClear}
            onSaveToHistory={handleManualSave}
            isSaved={isSaved}
          />
        </div>
      )}
    </div>
  );
};
