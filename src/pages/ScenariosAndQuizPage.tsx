import React, { useState } from 'react';
import {
  Gamepad2,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Award,
  BookOpen,
  Info,
  Check,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import { ContentType, SimulationScenario, QuizDomain } from '../types/cyber.ts';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';
import { AdaptiveQuizTab } from '../components/AdaptiveQuizTab.tsx';
import { ScamDetectiveTab } from '../components/ScamDetectiveTab.tsx';

interface ScenariosAndQuizPageProps {
  onTestInDetector: (type: ContentType, content: string, subject?: string) => void;
  initialTab?: 'scenarios' | 'quiz' | 'detective';
  initialDomain?: QuizDomain;
  onNavigate?: (page: string) => void;
}

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim-kyc',
    title: 'Scenario 1: Fake Bank KYC Account Suspension',
    type: 'whatsapp',
    sender_preview: '+91 98210 55419 ("State Bank Verification")',
    content: '🚨 FINAL WARNING: Dear SBI Customer, your bank account and linked UPI will be suspended today at 10:00 PM due to outdated PAN and KYC records. To re-activate immediately, visit our secure verification portal: http://sbi-kyc-verify-portal.click/login or call manager 9821055419.',
    context: 'You receive this WhatsApp message at 8:45 PM on a weekday.',
    options: [
      {
        id: 'opt-click',
        text: 'Click the link immediately to submit PAN and avoid your account getting blocked before 10 PM.',
        is_safe: false,
        feedback: 'SCAM TRAP! The link leads to a counterfeit phishing portal designed to harvest your NetBanking username, password, and OTP.',
      },
      {
        id: 'opt-call',
        text: 'Call the mobile number provided in the message to ask the "manager" what documents are needed.',
        is_safe: false,
        feedback: 'DANGEROUS! The phone number belongs to the cyber criminal syndicate, who will impersonate bank staff and urge you to read out OTPs or download AnyDesk.',
      },
      {
        id: 'opt-official-app',
        text: 'Ignore the message, do not click the link, and check your KYC status directly inside the official YONO SBI banking app.',
        is_safe: true,
        feedback: 'EXCELLENT! Official banks never send suspension notices from 10-digit mobile numbers or third-party .click links. Always verify via the official app.',
      },
      {
        id: 'opt-forward',
        text: 'Forward the message to your family WhatsApp group to warn them to update their KYC too.',
        is_safe: false,
        feedback: 'UNSAFE! Forwarding the phishing message without verification can cause unsuspecting relatives to click the malicious link.',
      },
    ],
    red_flags: [
      'Sent from an ordinary personal mobile number (+91 98210...) instead of registered bank alphabetic SMS sender code',
      'Artificial countdown deadline ("10:00 PM tonight") designed to cause panic',
      'Suspicious domain extension: .click instead of official sbi.co.in domain',
    ],
    psychological_triggers: ['Urgency (Countdown panic)', 'Fear of Financial Loss', 'Impersonation of Established Authority'],
    recommended_action: 'Never click links in SMS or WhatsApp. Verify account status only via your official banking app or branch.',
  },
  {
    id: 'sim-job',
    title: 'Scenario 2: High-Paying Part-Time Telegram Job',
    type: 'whatsapp',
    sender_preview: '+62 838 2910 4492 ("HR Priya - Global Media")',
    content: 'Hello! I am Priya from Global Talent Corp. We saw your resume on job portals. You can earn ₹3,000 to ₹8,000 daily from home by just liking 3 YouTube videos per day. No experience needed! We already credited ₹150 trial bonus to your UPI. Connect with our manager on Telegram @TaskLead_VIP to start.',
    context: 'You get an unexpected WhatsApp message from an international country code (+62 Indonesia).',
    options: [
      {
        id: 'opt-accept',
        text: 'Join the Telegram group and start completing tasks to earn extra income from home.',
        is_safe: false,
        feedback: 'SCAM TRAP! This is a classic "Prepaid Task Scam". After a trivial ₹150 initial payout, they will ask you to deposit ₹5,000 to unlock higher-tier assignments, stealing your deposits.',
      },
      {
        id: 'opt-block',
        text: 'Block the sender, report as spam on WhatsApp, and do not join any Telegram group.',
        is_safe: true,
        feedback: 'PERFECT! Legitimate multinational companies never hire via unsolicited WhatsApp texts from foreign country codes or manage salaries via anonymous Telegram channels.',
      },
      {
        id: 'opt-reply-money',
        text: 'Send your bank account details to receive more trial bonuses before deciding.',
        is_safe: false,
        feedback: 'RISKY! Sharing financial credentials with cyber criminals exposes your identity and accounts to illicit money laundering mule rings.',
      },
    ],
    red_flags: [
      'Unsolicited message from foreign country code (+62 Indonesia)',
      'Unrealistically high payout for menial tasks (₹8,000/day for liking videos)',
      'Routing conversations to anonymous Telegram user handles',
    ],
    psychological_triggers: ['Greed & Quick Money Temptation', 'Initial Small Reward Lure (₹150 trial bonus)', 'Low Barrier to Entry'],
    recommended_action: 'Immediately report and block the number on WhatsApp. Never transfer money to "unlock" work-from-home tasks.',
  },
  {
    id: 'sim-electricity',
    title: 'Scenario 3: Electricity Power Disconnection Urgency',
    type: 'sms',
    sender_preview: '+91 93392 81042',
    content: 'Dear Consumer, Your Electricity Power will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9339281042. Thank you.',
    context: 'Received via SMS at 7:15 PM on a summer evening.',
    options: [
      {
        id: 'opt-call-officer',
        text: 'Call Mr. Sharma immediately at 9339281042 to prevent power cutoff tonight.',
        is_safe: false,
        feedback: 'SCAM TRAP! The fake officer will instruct you to install an app like "QuickSupport" or send a ₹10 test recharge to siphon thousands from your bank.',
      },
      {
        id: 'opt-check-portal',
        text: 'Log into your state electricity board official portal or consumer mobile app to check bill status.',
        is_safe: true,
        feedback: 'CORRECT DEFENSE! Utility boards never disconnect power within 2 hours without formal written demand notices, and genuine bills are always verified on official government portals.',
      },
      {
        id: 'opt-pay-upi',
        text: 'Ask the sender for a UPI QR code to clear any pending balance instantly.',
        is_safe: false,
        feedback: 'DANGEROUS! Any UPI ID provided by the fraudster leads directly to an untraceable criminal wallet.',
      },
    ],
    red_flags: [
      'Sent from a 10-digit mobile number rather than authorized government SMS sender ID (e.g., BESCOM, TNEB, TPDDL)',
      'Threat of same-evening disconnection without legal statutory notice',
      'Directing user to a personal mobile number instead of toll-free utility helpline',
    ],
    psychological_triggers: ['Acute Panic & Disruption Fear', 'Strict Same-Day Countdown', 'Fictitious Authority Impersonation'],
    recommended_action: 'Verify bills exclusively on your state electricity board website or app. Never install screen-sharing software at the request of an SMS caller.',
  },
  {
    id: 'sim-parcel',
    title: 'Scenario 4: Suspicious Customs Courier Parcel & Fee',
    type: 'email',
    sender_preview: 'tracking-service@dhl-express-parcel-clearance.top',
    content: 'Subject: Notification: Your international parcel #IN88921-X is held at Delhi Customs due to unpaid duty charges (₹1,450). Pay clearance fee within 24 hours to avoid package return to sender: http://delhi-customs-clearance.top/pay',
    context: 'You receive this email notification while awaiting various online deliveries.',
    options: [
      {
        id: 'opt-pay-fee',
        text: 'Pay ₹1,450 on the website to avoid your parcel getting sent back.',
        is_safe: false,
        feedback: 'SCAM TRAP! The payment gateway is fraudulent and records your credit/debit card number, CVV, and OTP to drain your account balance.',
      },
      {
        id: 'opt-official-track',
        text: 'Open the official DHL or India Post website directly in your browser and check the consignment number.',
        is_safe: true,
        feedback: 'SAFE! Always enter tracking numbers directly on official courier domains (dhl.com or indiapost.gov.in). Look out for fake domains ending in .top or .xyz.',
      },
    ],
    red_flags: [
      'Sender email domain ends in .top rather than official corporate domain (dhl.com)',
      'Artificial deadline with penalty of return',
      'Unsecured HTTP link with high-risk TLD',
    ],
    psychological_triggers: ['Curiosity & Anticipation', 'Sunk Cost Panic', 'Authority of Customs Dept'],
    recommended_action: 'Never enter banking credentials on unknown .top links. Validate tracking numbers on official courier portals only.',
  },
  {
    id: 'sim-sim',
    title: 'Scenario 5: Free 5G SIM Upgrade / e-SIM Swap Attack',
    type: 'sms',
    sender_preview: '+91 78901 44231',
    content: 'Dear Airtel User, Your 4G SIM will be blocked tomorrow morning. To upgrade to 5G High Speed for FREE without visiting store, SMS "SIM <20-digit number> 121" to 121 now.',
    context: 'Received via SMS stating your existing SIM card will be deactivated.',
    options: [
      {
        id: 'opt-send-sms',
        text: 'Send the requested code to 121 to get free 5G activation without visiting the telecom store.',
        is_safe: false,
        feedback: 'FATAL TRAP! That 20-digit number belongs to a fraudster blank SIM card. Sending that SMS initiates a SIM SWAP that transfers your phone number and OTPs to the attacker phone!',
      },
      {
        id: 'opt-visit-store',
        text: 'Ignore the message or visit your nearest official Airtel/Jio company showroom in person.',
        is_safe: true,
        feedback: 'OUTSTANDING! 5G is automatic on compatible phones; you never need to send alphanumeric SIM codes to third parties. Telecoms mandate physical biometric verification for SIM swaps.',
      },
    ],
    red_flags: [
      'Demanding you forward internal telecom SIM change codes',
      'Sent from an unknown individual mobile number',
      'Threatening SIM deactivation',
    ],
    psychological_triggers: ['Fear of Loss of Phone Connectivity', 'Free Upgrade Incentive', 'Urgency'],
    recommended_action: 'Never send SIM swap codes or share 20-digit SIM numbers with anyone.',
  }
];

export const ScenariosAndQuizPage: React.FC<ScenariosAndQuizPageProps> = ({
  onTestInDetector,
  initialTab,
  initialDomain,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'quiz' | 'detective'>(
    initialTab || 'scenarios'
  );

  // Scenario State
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const scenario = SCENARIOS[selectedScenarioIndex];
  const selectedOption = scenario.options.find((o) => o.id === selectedOptionId);

  const handleSelectScenarioOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleNextScenario = () => {
    setSelectedOptionId(null);
    setSelectedScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Background Watermark */}
      <div className="absolute top-1/4 right-0 opacity-[0.04] pointer-events-none hidden md:block">
        <CyberKawachLogo size={480} variant="watermark" />
      </div>

      {/* Header */}
      <div className="space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] font-bold uppercase tracking-wider">
          <Gamepad2 className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Interactive Defensive Training</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#183B3A]">
          Scenarios &amp; Cyber Quiz
        </h1>
        <p className="text-sm text-[#526766] max-w-2xl leading-relaxed">
          Master real-world fraud identification. Practice realistic scam encounters, take adaptive cyber-awareness quizzes, or spot red flags in the Scam Detective Challenge.
        </p>
      </div>

      {/* Main Tab Switcher: Scenarios vs Adaptive Quiz vs Scam Detective */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs relative z-10">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
            activeTab === 'scenarios'
              ? 'bg-[#38BDF8] text-white shadow-md shadow-[#38BDF8]/25'
              : 'text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Attack Scenarios ({SCENARIOS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
            activeTab === 'quiz'
              ? 'bg-[#38BDF8] text-white shadow-md shadow-[#38BDF8]/25'
              : 'text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Adaptive Cyber Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('detective')}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
            activeTab === 'detective'
              ? 'bg-[#38BDF8] text-white shadow-md shadow-[#38BDF8]/25'
              : 'text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Scam Detective Challenge</span>
        </button>
      </div>

      {/* SECTION 1: ATTACK SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6 relative z-10">
          {/* Educational Simulation Banner */}
          <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] text-xs text-[#183B3A] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CyberKawachLogo size={20} variant="brand" />
              <span>
                <strong className="text-[#183B3A]">Simulated Educational Scenarios:</strong> All messages, phone numbers, and links are fictional simulations crafted strictly for defensive training.
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#176B61] font-bold shrink-0">
              Scenario {selectedScenarioIndex + 1} of {SCENARIOS.length}
            </span>
          </div>

          {/* Scenario Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setSelectedOptionId(null);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap focus:outline-none cursor-pointer ${
                  selectedScenarioIndex === idx
                    ? 'bg-[#38BDF8] text-white shadow-xs'
                    : 'bg-white border border-[#DCEBE7] text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
                }`}
              >
                Scenario {idx + 1}
              </button>
            ))}
          </div>

          {/* Main Simulation Workspace */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
                {scenario.type.toUpperCase()} Attack Simulation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#183B3A] mt-1">
                {scenario.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#526766] mt-1">
                Context: {scenario.context}
              </p>
            </div>

            {/* Mock Device Message Box */}
            <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCEBE7] text-xs text-[#526766] font-mono">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#176B61]" />
                  <span className="font-semibold text-[#183B3A]">Incoming Message</span>
                </div>
                <span className="text-[#526766] text-[11px]">{scenario.sender_preview}</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#DCEBE7] text-[#183B3A] text-sm leading-relaxed font-sans select-text shadow-xs">
                {scenario.content}
              </div>
            </div>

            {/* Decision Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#183B3A] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#38BDF8]" />
                  <span>What action would you take?</span>
                </h3>
                <span className="text-xs text-[#526766]">Select an option to evaluate risk:</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {scenario.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  let borderClass = 'border-[#DCEBE7] hover:border-[#38BDF8] hover:bg-[#E8F8F5] bg-white text-[#183B3A]';

                  if (isSelected) {
                    borderClass = option.is_safe
                      ? 'border-[#22C55E] bg-emerald-50 text-emerald-950 font-medium'
                      : 'border-[#EF4444] bg-rose-50 text-rose-950 font-medium';
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectScenarioOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer focus:outline-none ${borderClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected
                              ? option.is_safe
                                ? 'bg-[#22C55E] text-white'
                                : 'bg-[#EF4444] text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isSelected ? (
                            option.is_safe ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed font-medium">
                          {option.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instant Feedback Panel */}
            {selectedOption && (
              <div
                className={`p-5 rounded-2xl border space-y-4 animate-in fade-in-20 duration-200 ${
                  selectedOption.is_safe
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-sm">
                  {selectedOption.is_safe ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                      <span className="text-[#22C55E] uppercase tracking-wider font-mono">
                        Safe Decision Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
                      <span className="text-[#EF4444] uppercase tracking-wider font-mono">
                        Scam Trap Triggered
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed">
                  {selectedOption.feedback}
                </p>

                {/* Threat Mechanics Breakdown */}
                <div className="pt-2 border-t border-[#DCEBE7] space-y-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#526766] block mb-1 font-semibold">
                      Detected Red Flags:
                    </span>
                    <ul className="space-y-1">
                      {scenario.red_flags.map((flag, i) => (
                        <li key={i} className="text-xs text-[#183B3A] flex items-start gap-1.5">
                          <span className="text-[#EF4444] font-bold">&bull;</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#526766] block mb-1 font-semibold">
                      Psychological Manipulation Triggers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.psychological_triggers.map((trigger, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-semibold"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      onClick={() =>
                        onTestInDetector(
                          scenario.type,
                          scenario.content,
                          scenario.type === 'email' ? 'Customs Parcel Duty' : undefined
                        )
                      }
                      className="px-4 py-2.5 text-xs font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#38BDF8]/25 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Test in Live Scan Engine</span>
                    </button>

                    <button
                      onClick={handleNextScenario}
                      className="px-4 py-2.5 text-xs font-semibold text-[#183B3A] bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Next Scenario</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: ADAPTIVE CYBER SAFETY QUIZ */}
      {activeTab === 'quiz' && (
        <AdaptiveQuizTab
          initialDomain={initialDomain}
          onNavigateToDashboard={onNavigate ? () => onNavigate('dashboard') : undefined}
        />
      )}

      {/* SECTION 3: SCAM DETECTIVE CHALLENGE */}
      {activeTab === 'detective' && (
        <ScamDetectiveTab onTestInDetector={onTestInDetector} />
      )}
    </div>
  );
};
