import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
  Filter,
  Sliders,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { QuizQuestion, QuizDomain, QuizAttempt } from '../types/cyber.ts';
import {
  getAdaptiveQuizQuestions,
  saveQuizAttempt,
  AdaptiveSelectionResult,
} from '../services/userActivityService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

interface AdaptiveQuizTabProps {
  initialDomain?: QuizDomain;
  onNavigateToDashboard?: () => void;
}

export const AdaptiveQuizTab: React.FC<AdaptiveQuizTabProps> = ({
  initialDomain,
  onNavigateToDashboard,
}) => {
  const { user } = useAuth();

  // Configuration State
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<QuizDomain | 'all'>(
    initialDomain || 'all'
  );
  const [sessionLength, setSessionLength] = useState<number>(10);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [adaptiveMeta, setAdaptiveMeta] = useState<AdaptiveSelectionResult | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedAttempt, setSavedAttempt] = useState<QuizAttempt | null>(null);

  const startNewQuiz = async (
    domainFilter: QuizDomain | 'all' = selectedDomainFilter,
    length: number = sessionLength
  ) => {
    setLoading(true);
    setIsCompleted(false);
    setUserAnswers({});
    setCurrentIdx(0);
    setShowExplanation(false);
    setSavedAttempt(null);

    try {
      const result = await getAdaptiveQuizQuestions(
        user ? user.uid : null,
        length,
        domainFilter === 'all' ? undefined : domainFilter
      );
      setQuestions(result.questions);
      setAdaptiveMeta(result);
    } catch (err) {
      console.warn('Error loading adaptive questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewQuiz(selectedDomainFilter, sessionLength);
  }, [user, selectedDomainFilter, sessionLength]);

  const handleSelectAnswer = (optionId: string) => {
    if (showExplanation) return;
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: optionId }));
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Complete quiz and save attempt
      setIsCompleted(true);
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let score = 0;
    const domainScores: Record<QuizDomain, { correct: number; total: number; accuracy: number }> = {
      email: { correct: 0, total: 0, accuracy: 0 },
      whatsapp: { correct: 0, total: 0, accuracy: 0 },
      sms: { correct: 0, total: 0, accuracy: 0 },
      url: { correct: 0, total: 0, accuracy: 0 },
    };
    const questionIds: string[] = [];
    const incorrectQuestionIds: string[] = [];

    questions.forEach((q, idx) => {
      questionIds.push(q.id);
      const chosen = userAnswers[idx];
      const correctOpt = q.options.find((o) => o.isCorrect)?.id;
      const isCorrect = chosen === correctOpt;

      if (q.domain in domainScores) {
        domainScores[q.domain].total++;
        if (isCorrect) domainScores[q.domain].correct++;
      }

      if (isCorrect) {
        score++;
      } else {
        incorrectQuestionIds.push(q.id);
      }
    });

    (Object.keys(domainScores) as QuizDomain[]).forEach((d) => {
      const item = domainScores[d];
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    const attempt = await saveQuizAttempt(user ? user.uid : null, {
      score,
      totalQuestions: questions.length,
      accuracy,
      domainScores,
      mode: sessionLength > 10 ? 'extended' : selectedDomainFilter !== 'all' ? 'domain-focused' : 'standard',
      questionIds,
      incorrectQuestionIds,
    });

    setSavedAttempt(attempt);
  };

  const currentQ = questions[currentIdx];
  const selectedOption = currentQ?.options.find((o) => o.id === userAnswers[currentIdx]);
  const correctOption = currentQ?.options.find((o) => o.isCorrect);

  const getDomainIcon = (dom: string) => {
    switch (dom) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-[#176B61]" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-[#176B61]" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-[#176B61]" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-[#176B61]" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#176B61]" />;
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Session Controls & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Domain Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526766] mr-1 font-bold">
            Curriculum:
          </span>
          {[
            { id: 'all', label: 'Adaptive All (4 Vectors)' },
            { id: 'email', label: 'Email Phishing' },
            { id: 'whatsapp', label: 'WhatsApp Scams' },
            { id: 'sms', label: 'SMS Fraud' },
            { id: 'url', label: 'URL & Phishing' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedDomainFilter(item.id as any);
              }}
              className={`py-1.5 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedDomainFilter === item.id
                  ? 'bg-[#38BDF8] text-white shadow-xs font-bold'
                  : 'bg-[#F7FCFA] border border-[#DCEBE7] text-[#526766] hover:bg-[#E8F8F5] hover:text-[#183B3A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Session Length Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs font-mono">
          <span className="text-[11px] text-[#526766]">Length:</span>
          {[
            { length: 10, label: '10 Qs (Standard)' },
            { length: 20, label: '20 Qs (Extended)' },
          ].map((opt) => (
            <button
              key={opt.length}
              onClick={() => setSessionLength(opt.length)}
              className={`py-1 px-2.5 rounded-lg border cursor-pointer ${
                sessionLength === opt.length
                  ? 'bg-[#E8F8F5] text-[#176B61] border-[#B8F2E6] font-bold'
                  : 'bg-white text-[#526766] border-[#DCEBE7]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transparent Adaptive Algorithm Banner (Feature 6) */}
      {adaptiveMeta && (
        <div className="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] text-xs text-[#183B3A] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>
              <strong>Personalized Selection Engine:</strong> {adaptiveMeta.personalizationSummary}
            </span>
          </div>
          {adaptiveMeta.isPersonalized && (
            <span className="text-[10px] font-mono font-bold text-[#176B61] px-2 py-0.5 rounded-md bg-white border border-[#B8F2E6] shrink-0 hidden sm:inline-block">
              Weighted Adaptation Active
            </span>
          )}
        </div>
      )}

      {/* QUIZ INTERFACE */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs text-center space-y-3">
          <CyberKawachLogo size={36} variant="brand" className="mx-auto animate-spin" />
          <div className="text-xs font-bold text-[#183B3A]">
            Synthesizing personalized question sequence...
          </div>
        </div>
      ) : isCompleted ? (
        /* QUIZ COMPLETION SUMMARY CARD */
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#E8F8F5] border border-[#B8F2E6] text-[#176B61] flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8 text-[#38BDF8]" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F5] border border-[#B8F2E6] text-xs font-mono text-[#176B61] font-bold">
              <span>Session Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#183B3A]">
              Cyber Safety Performance Report
            </h2>
            <div className="text-5xl font-black font-mono text-[#183B3A] pt-2">
              {savedAttempt?.score} / {savedAttempt?.totalQuestions}
              <span className="text-2xl text-[#176B61] ml-2 font-bold">
                ({savedAttempt?.accuracy}%)
              </span>
            </div>
            <p className="text-xs text-[#526766] leading-relaxed">
              {savedAttempt && savedAttempt.accuracy >= 80
                ? 'Excellent instincts! You consistently detected social engineering triggers and deceptive infrastructure.'
                : savedAttempt && savedAttempt.accuracy >= 60
                ? 'Solid foundational instincts! Review the domain recommendations below to fortify remaining blind spots.'
                : 'Essential learning opportunity. Re-run this drill to build muscle memory against deceptive techniques.'}
            </p>
          </div>

          {/* Domain Accuracy Breakdown */}
          {savedAttempt?.domainScores && (
            <div className="p-5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-3">
              <div className="text-xs font-bold text-[#183B3A] font-mono uppercase tracking-wider">
                Domain-Wise Accuracy Breakdown:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(savedAttempt.domainScores).map(([dom, data]) => {
                  if (data.total === 0) return null;
                  return (
                    <div
                      key={dom}
                      className="p-3 rounded-xl bg-white border border-[#DCEBE7] space-y-1 text-center"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#526766]">
                        {dom}
                      </div>
                      <div className="text-base font-bold font-mono text-[#183B3A]">
                        {data.correct} / {data.total}
                      </div>
                      <div className="text-[11px] text-[#176B61] font-bold">
                        {data.accuracy}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startNewQuiz()}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start New Adaptive Drill</span>
            </button>

            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white border border-[#DCEBE7] hover:bg-[#E8F8F5] text-[#183B3A] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#176B61]" />
                <span>View Updated Fitness Score</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ACTIVE QUESTION WORKSPACE */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCEBE7]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#E8F8F5] border border-[#B8F2E6]">
                {getDomainIcon(currentQ.domain)}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#176B61]">
                {currentQ.domain.toUpperCase()} Fraud Defense
              </span>
              <span className="text-slate-300">&bull;</span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                  currentQ.difficulty === 'easy'
                    ? 'bg-emerald-50 text-emerald-700'
                    : currentQ.difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {currentQ.difficulty} Level
              </span>
            </div>

            <div className="text-xs font-mono font-bold text-[#183B3A]">
              Question {currentIdx + 1} of {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#38BDF8] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Learning Objective Tag */}
          <div className="text-[11px] font-mono text-[#526766] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#176B61]" />
            <span>Objective: {currentQ.learningObjective}</span>
          </div>

          {/* Question Prompt */}
          <h3 className="text-base sm:text-lg font-bold text-[#183B3A] leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentIdx] === opt.id;
              let optionStyle =
                'bg-[#F7FCFA] border-[#DCEBE7] text-[#183B3A] hover:bg-white hover:border-[#38BDF8]';

              if (showExplanation) {
                if (opt.isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAnswer(opt.id)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-2xl text-xs sm:text-sm transition-all border flex items-start gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-xl border border-[#DCEBE7] bg-white text-[#183B3A] text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="leading-snug pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Real-Time Explanation Card */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                {selectedOption?.isCorrect ? (
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Defense Analysis!</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Vulnerable Response Detected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#183B3A] leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="text-[11px] font-mono text-[#176B61] pt-1">
                <strong>Warning Indicator:</strong> {currentQ.warningIndicator}
              </div>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="py-3 px-6 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Performance Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
