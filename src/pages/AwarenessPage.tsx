import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Smartphone,
  CreditCard,
  KeyRound,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio
} from 'lucide-react';
import { AwarenessGuide, ContentType } from '../types/cyber.ts';
import { ThreatIntelligenceFeed } from '../components/ThreatIntelligenceFeed.tsx';

interface AwarenessPageProps {
  onNavigateToDetector?: (type: ContentType, content: string, subject?: string) => void;
}

const GUIDES: AwarenessGuide[] = [
  {
    id: 'upi-fraud',
    title: 'UPI & QR Code Payment Frauds',
    category: 'Financial Safety',
    iconName: 'CreditCard',
    summary: 'Scammers send collect requests or fake QR codes claiming you need to "scan or enter PIN to receive lottery money or marketplace payment".',
    tactics: [
      'Sending a UPI "Collect Request" disguised as a refund or advance payment',
      'Sending a QR code on WhatsApp saying "Scan this QR code to receive money in your account"',
      'Asking you to make a small ₹1 test payment to "verify your UPI handle"',
    ],
    redFlags: [
      'Anyone asking you to enter your UPI PIN to RECEIVE funds (UPI PIN is ONLY required to SEND money)',
      'QR codes sent for receiving cashback, olx item payments, or prize rewards',
      'Urgent requests asking you to approve a pending request inside PhonePe/GPay/Paytm',
    ],
    preventionSteps: [
      'Golden Rule: You NEVER enter your UPI PIN to receive money. PIN is strictly for debiting your account.',
      'Never scan any QR code sent via WhatsApp or Telegram to receive payment.',
      'Check the account name and amount carefully before authorizing any UPI transaction.',
    ],
    realWorldExample: '"Buyer" on an online marketplace agrees to buy your used furniture without seeing it, sends a QR code on WhatsApp, and says: "Sir, scan this QR code and type PIN, your ₹15,000 will be credited directly."'
  },
  {
    id: 'kyc-electricity',
    title: 'Fake KYC & Electricity Disconnection Threats',
    category: 'Phishing & Impersonation',
    iconName: 'ShieldAlert',
    summary: 'Fraudsters send SMS claiming your electricity power will be cut off tonight at 9:30 PM or your bank account blocked due to pending KYC.',
    tactics: [
      'High-urgency artificial countdown ("power cut tonight at 9:30 PM" or "account blocked within 24 hours")',
      'Providing an unofficial mobile phone number of a fake "officer" to call',
      'Directing to a phishing portal with deceptive domains (e.g. sbi-kyc-update.xyz)',
    ],
    redFlags: [
      'Message sent from standard 10-digit personal mobile numbers instead of official corporate headers (like VM-SBIBNK or CP-EBILL)',
      'Demanding immediate call to an unverified individual cell number',
      'Threatening instant disconnection without formal prior registered letters or utility notices',
    ],
    preventionSteps: [
      'Check your electricity bill status exclusively on your state electricity board official portal or bill payment app.',
      'Never call mobile numbers provided inside warning SMS.',
      'Banks never ask for KYC updates via external WhatsApp links.',
    ],
    realWorldExample: '"Dear Consumer, Your electricity will be disconnected tonight at 9:30 PM because bill was not updated. Immediately call officer Mr. Gupta at 9876543210."'
  },
  {
    id: 'digital-arrest',
    title: '"Digital Arrest" & Police/CBI Impersonation',
    category: 'Extortion & Intimidation',
    iconName: 'Lock',
    summary: 'Cyber criminals impersonate CBI, Police, Customs, or TRAI officials over video calls, claiming your Aadhaar is linked to illegal narcotics packages or money laundering.',
    tactics: [
      'Creating fake police station backdrops with uniforms and forged arrest warrants',
      'Coercing victims into staying on continuous video calls under the fictional concept of "Digital Arrest"',
      'Demanding transfer of savings into "RBI safe custody accounts" for verification',
    ],
    redFlags: [
      'There is NO such legal concept as "Digital Arrest" under Indian law or international jurisprudence',
      'Police or investigative agencies never interrogate suspects via Skype, WhatsApp, or video calls',
      'Government agencies never ask you to transfer funds to any account to "clear charges"',
    ],
    preventionSteps: [
      'Immediately disconnect any video call claiming to be law enforcement placing you under arrest.',
      'Dial 1930 or report to local police station immediately.',
      'Do not transfer money to any bank account under fear or intimidation.',
    ],
    realWorldExample: 'Call claiming: "A courier in your name containing 5 passports and illegal drugs was seized at Mumbai airport. You are under digital arrest. Transfer your savings to this verification account to avoid arrest."'
  },
  {
    id: 'part-time-job',
    title: 'Work-From-Home & Telegram Task Scams',
    category: 'Employment Fraud',
    iconName: 'Globe2',
    summary: 'Victims are offered lucrative part-time jobs liking YouTube videos, rating Google Maps hotels, or writing reviews, leading to fake investment deposits.',
    tactics: [
      'Initial small payouts (e.g. ₹150–₹500) to build trust and prove "legitimacy"',
      'Adding victims to Telegram groups showing fake screenshots of other users making huge profits',
      'Requiring "prepaid task deposits" to unlock VIP assignments, where money can never be withdrawn',
    ],
    redFlags: [
      'Unsolicited WhatsApp job offers from international country codes (+62, +84, +234, +44)',
      'Promise of ₹3,000–₹10,000 per day for trivial tasks like liking videos',
      'Any job requiring YOU to pay deposit money before getting paid your salary',
    ],
    preventionSteps: [
      'Block and report unsolicited job offers received on WhatsApp or Telegram.',
      'Legitimate multinational corporations never hire or run payroll through anonymous Telegram channels.',
      'Never pay "security deposits" or "recharge fees" to execute tasks.',
    ],
    realWorldExample: '"Hi, I am HR from Global Media. Earn ₹5,000 daily from home just by liking YouTube videos. Contact our manager on Telegram @TaskAdmin."'
  },
  {
    id: 'otp-remote-access',
    title: 'OTP Theft & Remote Desktop (AnyDesk/TeamViewer)',
    category: 'Account Takeover',
    iconName: 'Smartphone',
    summary: 'Fraudsters impersonating customer care trick users into reading aloud SMS OTPs or installing screen-sharing apps like AnyDesk, TeamViewer, or QuickSupport.',
    tactics: [
      'Fake customer care numbers indexed on search engines for airlines, courier services, or banks',
      'Claiming an urgent refund is stuck and requires a "remote assistance session"',
      'Viewing your mobile screen live while you enter bank credentials and OTPs',
    ],
    redFlags: [
      'Any "customer care agent" telling you to download AnyDesk, RustDesk, or TeamViewer on your phone',
      'Requests to read out a 6-digit numeric code sent by your bank',
      'Caller saying "Do not look at the SMS, just read the last numbers"',
    ],
    preventionSteps: [
      'Never share OTPs, CVVs, or NetBanking passwords with anyone under any pretext.',
      'Never install remote desktop apps at the request of an unknown caller.',
      'Look up customer service phone numbers only on the company’s official verified website, never on Google search ad snippets.',
    ],
    realWorldExample: '"Sir, to process your courier refund of ₹250, please install AnyDesk from Play Store and provide the 9-digit code so our technician can verify."'
  },
  {
    id: 'password-hygiene',
    title: 'Credential Stuffing & Password Security',
    category: 'Cyber Hygiene',
    iconName: 'KeyRound',
    summary: 'Attackers use credentials leaked from past third-party data breaches to breach email, banking, and social accounts sharing identical passwords.',
    tactics: [
      'Automated credential stuffing across multiple web services',
      'Sim-swapping attacks to intercept SMS-based 2FA',
      'Phishing login pages mimicking Microsoft, Google, or university portals',
    ],
    redFlags: [
      'Password reset request SMS you did not initiate',
      'Notifications of new logins from unfamiliar locations or devices',
      'Websites asking you to verify your password over an unencrypted HTTP connection',
    ],
    preventionSteps: [
      'Use a unique, complex passphrase for each critical service (banking, primary email, work).',
      'Enable Multi-Factor Authentication (MFA) using authenticator apps (Google Authenticator, Microsoft Authenticator) instead of SMS OTP wherever possible.',
      'Use a trusted password manager rather than keeping passwords in text files or browser unencrypted notes.',
    ],
    realWorldExample: 'Reusing your pet name password "Rocky@123" across your gaming forum, personal Gmail, and bank account enables attackers to compromise your bank if the forum suffers a breach.'
  }
];

export const AwarenessPage: React.FC<AwarenessPageProps> = ({ onNavigateToDetector }) => {
  const [expandedGuide, setExpandedGuide] = useState<string | null>('upi-fraud');

  // Interactive Cyber Hygiene Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'mfa-enabled': true,
    'unique-passwords': true,
    'no-otp-sharing': true,
    'verify-urls': false,
    'no-remote-tools': true,
    'official-apps-only': true,
    'lock-sim': false,
    'regular-backup': false,
  });

  const checklistItems = [
    { id: 'mfa-enabled', label: 'Enabled Two-Factor Authentication (2FA) on primary email & banking accounts' },
    { id: 'unique-passwords', label: 'Use unique, strong passwords for critical banking and email portals' },
    { id: 'no-otp-sharing', label: 'Strict personal rule: Never share OTPs or UPI PIN with anyone under any circumstance' },
    { id: 'verify-urls', label: 'Inspect website URLs for HTTPS and correct spellings before entering credentials' },
    { id: 'no-remote-tools', label: 'Refuse to install screen-sharing apps (AnyDesk, TeamViewer) on caller instructions' },
    { id: 'official-apps-only', label: 'Download financial apps exclusively from official Google Play Store or Apple App Store' },
    { id: 'lock-sim', label: 'Set a SIM PIN lock on your mobile carrier to defend against SIM-swap fraud' },
    { id: 'regular-backup', label: 'Maintain encrypted offline backups of critical personal documents and data' },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const hygienePercentage = Math.round((checkedCount / checklistItems.length) * 100);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] uppercase tracking-wider font-bold">
            <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Knowledge, Real-Time Intelligence &amp; Prevention Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#183B3A]">
            Cyber Safety &amp; Threat Intelligence
          </h1>
          <p className="text-sm text-[#526766] max-w-2xl leading-relaxed">
            The strongest firewall is an informed human mind. Track active global vulnerabilities, explore scam defense deep-dives, and evaluate personal cyber hygiene.
          </p>
        </div>

        {/* Section Jump Links */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={() => scrollToSection('threat-feed')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#176B61] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Radio className="w-3 h-3 text-[#38BDF8]" />
            <span>Live Threat Feed</span>
          </button>
          <button
            onClick={() => scrollToSection('hygiene-check')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#183B3A] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Hygiene Assessment
          </button>
          <button
            onClick={() => scrollToSection('scam-guides')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#183B3A] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Scam Modalities Deep-Dive
          </button>
          <button
            onClick={() => scrollToSection('helplines')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#183B3A] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Emergency 1930 Helpline
          </button>
        </div>
      </div>

      {/* DEDICATED REAL-TIME THREAT INTELLIGENCE FEED SECTION */}
      <div id="threat-feed" className="scroll-mt-24">
        <ThreatIntelligenceFeed onInspectInDetector={onNavigateToDetector} />
      </div>

      {/* Interactive Cyber Hygiene Readiness Meter */}
      <section id="hygiene-check" className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEBE7] space-y-6 scroll-mt-24 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCEBE7]">
          <div>
            <h3 className="text-base font-bold text-[#183B3A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#176B61]" />
              <span>Personal Cyber Hygiene Readiness Assessment</span>
            </h3>
            <p className="text-xs text-[#526766] mt-0.5">
              Check the safety practices you currently observe to benchmark your digital security posture:
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-[#176B61] tabular-nums">
                {hygienePercentage}%
              </div>
              <div className="text-[10px] text-[#526766] uppercase tracking-wider font-semibold">
                Readiness Score
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center">
              <span className="text-lg">
                {hygienePercentage >= 80 ? '🛡️' : hygienePercentage >= 50 ? '⚠️' : '🚨'}
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => (
            <label
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors text-xs ${
                checklist[item.id]
                  ? 'bg-[#E8F8F5] border-[#B8F2E6] text-[#183B3A] font-medium'
                  : 'bg-white border-[#DCEBE7] text-[#526766] hover:bg-[#F7FCFA]'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[item.id] || false}
                onChange={() => toggleChecklist(item.id)}
                className="mt-0.5 rounded border-[#DCEBE7] text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <span className="leading-relaxed">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Detailed Scam Breakdown Guides */}
      <section id="scam-guides" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#183B3A] tracking-tight">
            Common Online Scam Deep-Dives
          </h2>
          <span className="text-xs text-[#526766] font-mono">
            {GUIDES.length} Core Modalities
          </span>
        </div>

        <div className="space-y-3">
          {GUIDES.map((guide) => {
            const isExpanded = expandedGuide === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl bg-white border border-[#DCEBE7] overflow-hidden transition-all shadow-xs"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#F7FCFA] transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61] shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
                        {guide.category}
                      </div>
                      <h3 className="text-base font-bold text-[#183B3A] mt-0.5">
                        {guide.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[#526766] shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 pt-2 border-t border-[#DCEBE7] space-y-5 text-xs text-[#526766]">
                    <p className="leading-relaxed bg-[#F7FCFA] p-3.5 rounded-xl border border-[#DCEBE7] text-[#183B3A]">
                      {guide.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Red Flags */}
                      <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Key Red Flags</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {guide.redFlags.map((rf, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-rose-900 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span>{rf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention Steps */}
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>How to Protect Yourself</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {guide.preventionSteps.map((ps, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-emerald-950 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{ps}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Real World Case Example */}
                    <div className="p-3.5 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6]">
                      <div className="text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider mb-1">
                        Realistic Scam Scenario Example:
                      </div>
                      <div className="italic text-[#183B3A]">
                        {guide.realWorldExample}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Official Reporting Directory */}
      <section id="helplines" className="p-6 sm:p-7 rounded-3xl bg-[#B8F2E6]/35 border border-[#A2E8D9] space-y-4 scroll-mt-24 shadow-xs">
        <h3 className="text-base font-bold text-[#183B3A] flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#176B61]" />
          <span>Official Incident Reporting &amp; Cyber Assistance</span>
        </h3>
        <p className="text-xs text-[#526766] leading-relaxed">
          If you or someone you know has lost money or shared banking credentials with fraudsters, immediate action within the first 2–4 hours (the "Golden Hours") dramatically improves the probability of freezing the stolen transaction before cash withdrawal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] space-y-1 shadow-xs">
            <div className="text-xs text-[#526766] font-medium">India National Cyber Crime Portal</div>
            <div className="text-lg font-bold font-mono text-[#183B3A]">Dial 1930 (Toll Free)</div>
            <div className="text-[11px] text-[#526766]/80">Operated by Ministry of Home Affairs (MHA), Govt of India</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] space-y-1 shadow-xs">
            <div className="text-xs text-[#526766] font-medium">Online Cyber Complaint Filing</div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-[#176B61] hover:text-[#183B3A] flex items-center gap-1.5 transition-colors"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" />
            </a>
            <div className="text-[11px] text-[#526766]/80">File official e-complaints for financial fraud and social media harassment</div>
          </div>
        </div>
      </section>
    </div>
  );
};
