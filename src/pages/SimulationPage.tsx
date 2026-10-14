import React, { useState } from 'react';
import {
  Gamepad2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ContentType, SimulationScenario } from '../types/cyber.ts';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';

interface SimulationPageProps {
  onTestInDetector: (type: ContentType, content: string, subject?: string) => void;
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
        feedback: 'CORRECT! Legitimate corporations never recruit via unsolicited WhatsApp messages from overseas numbers or run payroll through anonymous Telegram channels.',
      },
      {
        id: 'opt-negotiate',
        text: 'Reply asking for an official offer letter and corporate email address.',
        is_safe: false,
        feedback: 'RISKY! Engaging confirms that your phone number is active and responsive, leading to more aggressive targeted scam outreach.',
      },
    ],
    red_flags: [
      'Unsolicited WhatsApp outreach from an Indonesian (+62) country code claiming to be an Indian HR recruiter',
      'Exorbitant payout for zero-skill work (₹8,000/day for liking videos)',
      'Directing conversation to Telegram, which provides anonymity to criminal syndicates',
    ],
    psychological_triggers: ['Greed / Effortless Wealth', 'Initial Small Reciprocity (Fake ₹150 bonus)', 'Sunk Cost Manipulation'],
    recommended_action: 'Block and report the number immediately. Legitimate companies never hire via random WhatsApp chats.',
  },
  {
    id: 'sim-upi',
    title: 'Scenario 3: Buyer Scanning QR Code on OLX/Marketplace',
    type: 'whatsapp',
    sender_preview: 'Buyer "Major Rajesh Kumar"',
    content: 'Sir, I have transferred ₹22,000 for your sofa. The payment is locked in Indian Army defense quota escrow. To release the ₹22,000 into your bank account, please scan this attached QR code in PhonePe/GooglePay and enter your UPI PIN. The money will immediately credit.',
    context: 'You listed old furniture on a classifieds site 10 minutes ago. A buyer agreed to pay full price without haggling.',
    options: [
      {
        id: 'opt-scan',
        text: 'Scan the QR code in Google Pay and type your 6-digit UPI PIN to receive the ₹22,000.',
        is_safe: false,
        feedback: 'DISASTROUS! You NEVER enter your UPI PIN to receive money. Entering your PIN authorizes an immediate DEBIT from your bank account!',
      },
      {
        id: 'opt-reject',
        text: 'Refuse firmly and tell the buyer that UPI credits occur automatically to a phone number or VPA without scanning QR codes or typing PINs.',
        is_safe: true,
        feedback: 'EXCELLENT! UPI PIN is ONLY entered when paying out or debiting funds. Receiving money is completely automatic and requires zero PIN input.',
      },
      {
        id: 'opt-try-zero',
        text: 'Scan the QR code but enter a wrong PIN just to see what happens.',
        is_safe: false,
        feedback: 'RISKY! Scanning unknown QR codes can trigger malicious deep links or third-party web portals in your browser.',
      },
    ],
    red_flags: [
      'Claiming to be an Army/Defense officer to establish false integrity and trust',
      'Claiming that scanning a QR code or entering a PIN is necessary to "receive" funds',
      'Buyer ready to pay instant full price without inspecting the item',
    ],
    psychological_triggers: ['Authority / Patriotic Trust (Fictional Army Officer)', 'Urgency', 'Technical Misunderstanding of UPI'],
    recommended_action: 'Remember the golden rule: To RECEIVE money on UPI, you NEVER need to enter a PIN or scan a QR code.',
  },
  {
    id: 'sim-electricity',
    title: 'Scenario 4: Electricity Disconnection at 9:30 PM Tonight',
    type: 'sms',
    sender_preview: 'BZ-POWERC',
    content: 'Dear consumer electricity power will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9339281042. Thank you.',
    context: 'You receive this SMS around 5:00 PM on a Friday.',
    options: [
      {
        id: 'opt-call-sharma',
        text: 'Call "Mr. Sharma" immediately at 9339281042 to clear your bill and prevent power cut.',
        is_safe: false,
        feedback: 'SCAM TRAP! The caller will pretend to be an officer and ask you to download a "bill update app" (AnyDesk/TeamViewer) or pay ₹10 via a malicious link, draining your account.',
      },
      {
        id: 'opt-verify-board',
        text: 'Do not call the number. Check your bill status on your state electricity distribution board official website or app.',
        is_safe: true,
        feedback: 'PERFECT! Real utility providers never disconnect power without formal written notices, and they never ask consumers to call personal 10-digit mobile numbers.',
      },
      {
        id: 'opt-pay-random',
        text: 'Ask the person for their Google Pay number and send ₹500 to keep the power on.',
        is_safe: false,
        feedback: 'SCAM TRAP! Utility payments are never collected into personal individual UPI handles.',
      },
    ],
    red_flags: [
      'Lists a private 10-digit personal mobile number instead of an official customer support helpline',
      'Creates panic by specifying a same-night deadline ("9:30 PM tonight")',
      'Poor grammatical structure and non-standard syntax',
    ],
    psychological_triggers: ['Panic / Disruption of Basic Utility', 'Urgency', 'Fear of Blackout'],
    recommended_action: 'Verify bills exclusively through your utility provider’s verified portal or trusted payment apps.',
  },
  {
    id: 'sim-courier',
    title: 'Scenario 5: Held Customs Parcel with ₹450 Fee Link',
    type: 'sms',
    sender_preview: 'AD-DELIVR',
    content: 'Your package #IN88921 cannot be delivered due to incomplete delivery address and pending customs clearance fee of ₹450. Please update address and pay fee within 12 hours at http://indiapost-parcel-delivery.top/update or parcel will be returned.',
    context: 'You frequently order online goods and cannot remember if an item was pending delivery.',
    options: [
      {
        id: 'opt-pay-courier',
        text: 'Click the link and pay ₹450 with your credit/debit card to release your delivery.',
        is_safe: false,
        feedback: 'SCAM TRAP! The fake website steals your credit card numbers, CVV, and OTP, charging thousands instead of ₹450.',
      },
      {
        id: 'opt-track-official',
        text: 'Copy the tracking number and check it directly on the official India Post or courier company website (e.g. indiapost.gov.in).',
        is_safe: true,
        feedback: 'EXCELLENT! Genuine courier companies do not use .top domains. Always verify tracking IDs directly on the official courier portal.',
      },
    ],
    red_flags: [
      'Suspicious domain extension: .top instead of official .gov.in or company domain',
      'Demanding card details on an unverified link',
      'Artificial 12-hour return threat',
    ],
    psychological_triggers: ['Curiosity', 'FOMO (Fear of Missing Out on Parcel)', 'Low Initial Fee Trap (₹450)'],
    recommended_action: 'Never enter banking or card information on links received via SMS.',
  },
];

export const SimulationPage: React.FC<SimulationPageProps> = ({ onTestInDetector }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const scenario = SCENARIOS[selectedScenarioIndex];
  const selectedOption = scenario.options.find((o) => o.id === selectedOptionId);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleNextScenario = () => {
    setSelectedOptionId(null);
    setSelectedScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Decorative Watermark */}
      <div className="absolute top-1/4 right-0 opacity-[0.04] pointer-events-none hidden md:block">
        <CyberKawachLogo size={480} variant="watermark" />
      </div>

      {/* Header */}
      <div className="space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] uppercase tracking-wider font-bold">
          <Gamepad2 className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Interactive Defensive Training</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#183B3A]">
          Cyber Scam Simulator
        </h1>
        <p className="text-sm text-[#526766] max-w-2xl leading-relaxed">
          Test your fraud awareness against realistic simulated scam encounters. Make a decision, evaluate the consequences, and uncover the social engineering tricks scammers use.
        </p>
      </div>

      {/* Educational Simulation Banner */}
      <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] text-xs text-[#183B3A] flex items-center justify-between gap-3 relative z-10 shadow-xs">
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 relative z-10">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs relative z-10 space-y-6">
        <div>
          <span className="text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
            {scenario.type.toUpperCase()} Attack Simulation
          </span>
          <h2 className="text-xl font-bold text-[#183B3A] mt-1">
            {scenario.title}
          </h2>
          <p className="text-xs text-[#526766] mt-1">
            Context: {scenario.context}
          </p>
        </div>

        {/* Mock Device Message Box */}
        <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCEBE7] text-xs text-[#526766] font-mono">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-[#176B61]" />
              <span className="text-[#183B3A] font-semibold">Incoming Message</span>
            </div>
            <span className="text-[#526766] text-[11px]">{scenario.sender_preview}</span>
          </div>

          <div className="text-sm font-sans text-[#183B3A] leading-relaxed whitespace-pre-wrap select-all bg-white p-4 rounded-xl border border-[#DCEBE7] font-normal">
            {scenario.content}
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => onTestInDetector(scenario.type, scenario.content, scenario.subject)}
              className="text-xs text-[#176B61] hover:text-[#38BDF8] font-bold flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test This in AI Detection Engine &rarr;</span>
            </button>
          </div>
        </div>

        {/* User Choice Interactive Prompt */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#183B3A] uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>What Action Would You Take?</span>
          </h3>

          <div className="space-y-2.5">
            {scenario.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optionStyle = 'bg-white border-[#DCEBE7] hover:border-[#38BDF8] hover:bg-[#E8F8F5] text-[#183B3A]';
              if (isSelected) {
                optionStyle = opt.is_safe
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                  : 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-start gap-3 focus:outline-none cursor-pointer ${optionStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-[#DCEBE7] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono font-bold">
                    {opt.id.replace('opt-', '')[0].toUpperCase()}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback & Educational Breakdown (Triggered after choice) */}
        {selectedOption && (
          <div className="space-y-6 pt-4 border-t border-[#DCEBE7] animate-in fade-in-50 duration-200">
            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                selectedOption.is_safe
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {selectedOption.is_safe ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block text-sm font-bold mb-0.5">
                  {selectedOption.is_safe ? 'Safe &amp; Correct Decision!' : 'Dangerous Response Detected!'}
                </strong>
                {selectedOption.feedback}
              </div>
            </div>

            {/* Red Flags & Psychology Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Red Flags */}
              <div className="p-4 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-2">
                <span className="text-[11px] font-mono text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Warning Signs</span>
                </span>
                <ul className="space-y-1.5 text-xs text-[#526766]">
                  {scenario.red_flags.map((rf: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Psychological Triggers */}
              <div className="p-4 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-2">
                <span className="text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#176B61]" />
                  <span>Psychological Exploitation Used</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scenario.psychological_triggers.map((pt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] text-[11px] font-semibold"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#526766] pt-1 leading-relaxed">
                  Recommended Defense: {scenario.recommended_action}
                </p>
              </div>
            </div>

            {/* Next Scenario Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedOptionId(null)}
                className="text-xs text-[#526766] hover:text-[#183B3A] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Another Option</span>
              </button>

              <button
                onClick={handleNextScenario}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Next Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
