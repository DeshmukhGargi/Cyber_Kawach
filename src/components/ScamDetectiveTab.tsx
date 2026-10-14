import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Award,
  RefreshCw,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Info,
} from 'lucide-react';
import { ScamDetectiveChallenge, RedFlagIndicator } from '../types/cyber.ts';
import { SCAM_DETECTIVE_CHALLENGES } from '../data/scamDetectiveChallenges.ts';
import {
  saveScamDetectiveRecord,
  fetchUserDetectiveRecords,
} from '../services/userActivityService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

interface ScamDetectiveTabProps {
  onTestInDetector: (type: any, content: string, subject?: string) => void;
}

export const ScamDetectiveTab: React.FC<ScamDetectiveTabProps> = ({ onTestInDetector }) => {
  const { user } = useAuth();
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState<number>(0);
  const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});

  const challenge: ScamDetectiveChallenge = SCAM_DETECTIVE_CHALLENGES[selectedChallengeIdx];

  useEffect(() => {
    const loadCompleted = async () => {
      try {
        const records = await fetchUserDetectiveRecords(user ? user.uid : null);
        const map: Record<string, number> = {};
        records.forEach((r) => {
          map[r.challengeId] = r.score;
        });
        setCompletedMap(map);
      } catch (e) {
        console.warn('Error loading completed detective records:', e);
      }
    };
    loadCompleted();
  }, [user]);

  const handleToggleIndicator = (indicatorId: string) => {
    if (isRevealed) return;
    setSelectedIndicatorIds((prev) =>
      prev.includes(indicatorId) ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId]
    );
  };

  const handleRevealAnalysis = async () => {
    setIsRevealed(true);

    // Calculate score
    const actualRedFlags = challenge.indicators.filter((i) => i.isRedFlag);
    let correctCount = 0;
    actualRedFlags.forEach((rf) => {
      if (selectedIndicatorIds.includes(rf.id)) {
        correctCount++;
      }
    });

    // Save record to Firestore and localStorage
    try {
      await saveScamDetectiveRecord(user ? user.uid : null, {
        challengeId: challenge.id,
        identifiedIndicatorIds: selectedIndicatorIds,
        score: correctCount,
        totalPossible: actualRedFlags.length,
      });

      setCompletedMap((prev) => ({
        ...prev,
        [challenge.id]: correctCount,
      }));
    } catch (err) {
      console.warn('Error saving scam detective record:', err);
    }
  };

  const handleResetChallenge = () => {
    setSelectedIndicatorIds([]);
    setIsRevealed(false);
  };

  const actualRedFlags = challenge.indicators.filter((i) => i.isRedFlag);
  const score = actualRedFlags.filter((rf) => selectedIndicatorIds.includes(rf.id)).length;

  const getDomainIcon = (dom: string) => {
    switch (dom) {
      case 'email':
        return <Mail className="w-4 h-4 text-[#176B61]" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-[#176B61]" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-[#176B61]" />;
      case 'url':
        return <Globe className="w-4 h-4 text-[#176B61]" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-[#176B61]" />;
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#183B3A] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#B8F2E6] flex items-center justify-center shrink-0 text-[#176B61] shadow-xs">
            <Search className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#183B3A]">
              Scam Detective Challenge: Can You Spot the Red Flags?
            </div>
            <p className="text-[#526766] mt-0.5">
              Inspect authentic simulated fraudulent communications. Select every suspicious indicator you spot before revealing the forensic analysis.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#176B61] font-bold px-3 py-1 rounded-full bg-white border border-[#B8F2E6] shrink-0">
          Completed: {Object.keys(completedMap).length} / {SCAM_DETECTIVE_CHALLENGES.length}
        </div>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SCAM_DETECTIVE_CHALLENGES.map((ch, idx) => {
          const isSelected = selectedChallengeIdx === idx;
          const isSolved = completedMap[ch.id] !== undefined;
          return (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChallengeIdx(idx);
                setSelectedIndicatorIds([]);
                setIsRevealed(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#38BDF8] text-white shadow-xs'
                  : 'bg-white border border-[#DCEBE7] text-[#526766] hover:bg-[#E8F8F5] hover:text-[#183B3A]'
              }`}
            >
              {getDomainIcon(ch.domain)}
              <span>Case {idx + 1}: {ch.title}</span>
              {isSolved && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
              )}
            </button>
          );
        })}
      </div>

      {/* Case Investigation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Simulated Device Payload */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBE7] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase font-bold text-[10px] text-[#176B61] px-2 py-0.5 rounded-md bg-[#E8F8F5] border border-[#B8F2E6]">
                  {challenge.domain}
                </span>
                <span className="text-[#526766] font-medium">{challenge.scenarioType}</span>
              </div>
              <span className="font-mono text-[#526766] text-[11px]">{challenge.timestampDisplay}</span>
            </div>

            {/* Simulated Message Header */}
            <div className="p-3.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7] text-xs space-y-1 font-mono">
              <div className="text-[#526766]">
                <strong className="text-[#183B3A]">From:</strong> {challenge.senderDisplay}
              </div>
              {challenge.subject && (
                <div className="text-[#526766]">
                  <strong className="text-[#183B3A]">Subject:</strong> {challenge.subject}
                </div>
              )}
            </div>

            {/* Body Payload Box */}
            <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] font-sans text-xs sm:text-sm text-[#183B3A] leading-relaxed whitespace-pre-wrap select-text">
              {challenge.bodyContent}
            </div>

            <div className="text-[11px] text-[#526766] italic flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#176B61]" />
              <span>Context: {challenge.context}</span>
            </div>

            {/* Test in Scanner Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  onTestInDetector(
                    challenge.domain,
                    challenge.bodyContent,
                    challenge.subject
                  )
                }
                className="text-xs font-bold text-[#176B61] hover:text-[#183B3A] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inspect in AI Detection Engine</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Checklist & Reveal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-5">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
                Investigator Checklist
              </div>
              <h3 className="text-base font-extrabold text-[#183B3A]">
                Select Suspected Red Flags:
              </h3>
              <p className="text-xs text-[#526766]">
                Check all clues you believe are indicators of fraud or deceptive engineering.
              </p>
            </div>

            {/* Indicators Checklist */}
            <div className="space-y-2.5">
              {challenge.indicators.map((ind) => {
                const isSelected = selectedIndicatorIds.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => handleToggleIndicator(ind.id)}
                    disabled={isRevealed}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all border flex items-start gap-3 cursor-pointer ${
                      isRevealed
                        ? ind.isRedFlag
                          ? isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-emerald-50/50 border-dashed border-emerald-300 text-emerald-900'
                          : isSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                        : isSelected
                        ? 'bg-[#E8F8F5] border-[#38BDF8] text-[#183B3A] shadow-xs font-semibold'
                        : 'bg-[#F7FCFA] border-[#DCEBE7] text-[#526766] hover:bg-white hover:text-[#183B3A]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isRevealed ? (
                        ind.isRedFlag ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#38BDF8] border-[#38BDF8] text-white'
                              : 'border-[#DCEBE7] bg-white'
                          }`}
                        >
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="leading-snug">{ind.text}</div>
                      {isRevealed && (
                        <div className="text-[11px] text-[#526766] pt-1 border-t border-slate-200/60 leading-relaxed font-normal">
                          {ind.explanation}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            {!isRevealed ? (
              <button
                onClick={handleRevealAnalysis}
                disabled={selectedIndicatorIds.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer disabled:opacity-50"
              >
                <span>Reveal Forensic Breakdown ({selectedIndicatorIds.length} Selected)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Result Score Banner */}
                <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] text-center space-y-1">
                  <div className="text-xl font-black font-mono text-[#183B3A]">
                    {score} / {actualRedFlags.length} Red Flags Identified
                  </div>
                  <p className="text-xs text-[#176B61] font-medium">
                    {score === actualRedFlags.length
                      ? '🎯 Flawless forensic deduction! Zero-trust defense maintained.'
                      : 'Good effort! Review the forensic insights above to sharpen your radar.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleResetChallenge}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#DCEBE7] hover:bg-[#E8F8F5] text-xs font-semibold text-[#183B3A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#176B61]" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChallengeIdx((prev) => (prev + 1) % SCAM_DETECTIVE_CHALLENGES.length);
                      setSelectedIndicatorIds([]);
                      setIsRevealed(false);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Official Verification & Safe Next Steps (Revealed) */}
          {isRevealed && (
            <div className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
                  Official Verification Guidelines
                </div>
                <h4 className="text-xs font-bold text-[#183B3A]">
                  How to Verify Through Official Channels:
                </h4>
                <p className="text-xs text-[#526766] leading-relaxed">
                  {challenge.officialVerificationMethod}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#DCEBE7]">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B3A]">
                  Safe Next Steps:
                </div>
                <ul className="space-y-1 text-xs text-[#526766]">
                  {challenge.safeNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0 mt-1.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
