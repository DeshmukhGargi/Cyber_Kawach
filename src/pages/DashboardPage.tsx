import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  BookOpen,
  User,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';
import {
  calculateCyberFitnessScore,
  fetchUserQuizAttempts,
  getUserBadges,
} from '../services/userActivityService.ts';
import { fetchUserScansFromFirestore } from '../services/firestoreScanService.ts';
import { getScanHistory, ScanHistoryRecord } from '../services/historyStorage.ts';
import {
  CyberFitnessScoreData,
  QuizAttempt,
  UserBadge,
  ContentType,
} from '../types/cyber.ts';

interface DashboardPageProps {
  onNavigate: (page: string, params?: { type?: ContentType; content?: string }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [fitnessData, setFitnessData] = useState<CyberFitnessScoreData | null>(null);
  const [scans, setScans] = useState<ScanHistoryRecord[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const uid = user ? user.uid : null;
      const [scoreRes, quizRes, badgeRes] = await Promise.all([
        calculateCyberFitnessScore(uid),
        fetchUserQuizAttempts(uid),
        getUserBadges(uid),
      ]);

      let scanList: ScanHistoryRecord[] = [];
      if (user) {
        scanList = await fetchUserScansFromFirestore(user.uid);
      }
      if (scanList.length === 0) {
        scanList = getScanHistory();
      }

      setFitnessData(scoreRes);
      setQuizzes(quizRes);
      setBadges(badgeRes);
      setScans(scanList);
    } catch (err) {
      console.warn('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Derived metrics
  const totalScans = scans.length;
  const emailScans = scans.filter((s) => s.type === 'email').length;
  const whatsappScans = scans.filter((s) => s.type === 'whatsapp').length;
  const smsScans = scans.filter((s) => s.type === 'sms').length;
  const urlScans = scans.filter((s) => s.type === 'url').length;

  const totalQuizzes = quizzes.length;
  const avgAccuracy =
    totalQuizzes > 0
      ? Math.round(
          quizzes.reduce((acc, q) => acc + q.accuracy, 0) / totalQuizzes
        )
      : 0;

  // Weakest domain determination
  let weakestDomain = 'Email Security';
  let weakestDomainKey: ContentType = 'email';
  if (fitnessData?.domainStrengths) {
    let minScore = 100;
    Object.entries(fitnessData.domainStrengths).forEach(([dom, val]) => {
      if (val.score < minScore) {
        minScore = val.score;
        weakestDomainKey = dom as ContentType;
        if (dom === 'email') weakestDomain = 'Email Security';
        if (dom === 'whatsapp') weakestDomain = 'WhatsApp Scams';
        if (dom === 'sms') weakestDomain = 'SMS Fraud';
        if (dom === 'url') weakestDomain = 'URL & Phishing';
      }
    });
  }

  if (!loading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="flex justify-center">
          <CyberKawachLogo size={48} variant="brand" glow={true} />
        </div>
        <div className="p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#183B3A]">Authentication Required</h2>
            <p className="text-xs text-[#526766] leading-relaxed">
              Your Cyber Defense Command Center requires an active session to protect your personalized fitness metrics, badges, and scan logs.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#183B3A] text-xs font-bold transition-all cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Cyber Guardian';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      {/* Decorative ambient elements */}
      <div className="absolute top-12 right-12 w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DCEBE7]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] font-bold uppercase tracking-wider">
            <CyberKawachLogo size={16} variant="brand" />
            <span>Cyber Defense Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#183B3A] tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#526766]">
            {user ? user.email : 'Personal Security Profile'} &bull; Real-time threat metrics and adaptive educational progression.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('detection')}
            className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
          <button
            onClick={() => onNavigate('scenarios')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#E8F8F5] border border-[#DCEBE7] text-[#183B3A] text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#176B61]" />
            <span>Take Adaptive Quiz</span>
          </button>
        </div>
      </div>

      {/* Cyber Fitness Score Featured Card (Feature 7) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#DCEBE7]/70">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F5] border border-[#B8F2E6] text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Personalized Educational Progress Metric</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#183B3A]">
              Cyber Fitness Score
            </h2>
            <p className="text-xs text-[#526766] leading-relaxed">
              Calculated transparently across Quiz Accuracy (50%), Historical Improvement (20%), Awareness Training (15%), and Scam Detective Performance (15%).
            </p>
          </div>

          {/* Large Score Indicator */}
          <div className="flex items-center gap-5 self-stretch sm:self-auto justify-between sm:justify-start p-4 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7]">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#183B3A]">
                {fitnessData ? fitnessData.score : 65}
                <span className="text-xl text-[#526766] font-normal">/100</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#176B61] font-bold mt-0.5">
                Current Fitness Rating
              </div>
            </div>

            <div className="border-l border-[#DCEBE7] pl-4 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                {fitnessData?.trend === 'improving' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Improving
                  </span>
                ) : fitnessData?.trend === 'declining' ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> Needs Drill
                  </span>
                ) : (
                  <span className="text-[#176B61] flex items-center gap-1">
                    Steady Performance
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#526766]">
                Previous score: {fitnessData?.previousScore ?? 55}/100
              </div>
            </div>
          </div>
        </div>

        {/* 4 Factor Breakdown Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#526766]">
              Quiz Accuracy (50%)
            </div>
            <div className="text-lg font-bold font-mono text-[#183B3A] mt-1">
              {fitnessData?.breakdown.quizAccuracyWeight ?? 30} / 50 pts
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#526766]">
              Improvement (20%)
            </div>
            <div className="text-lg font-bold font-mono text-[#183B3A] mt-1">
              {fitnessData?.breakdown.improvementWeight ?? 14} / 20 pts
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#526766]">
              Awareness Study (15%)
            </div>
            <div className="text-lg font-bold font-mono text-[#183B3A] mt-1">
              {fitnessData?.breakdown.awarenessCompletionWeight ?? 8} / 15 pts
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#526766]">
              Scam Detective (15%)
            </div>
            <div className="text-lg font-bold font-mono text-[#183B3A] mt-1">
              {fitnessData?.breakdown.detectivePerformanceWeight ?? 10} / 15 pts
            </div>
          </div>
        </div>

        {/* Domain-wise Strengths and Weakest Area Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Domain Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#183B3A] font-mono uppercase tracking-wider">
              Domain-Wise Strengths
            </div>
            <div className="space-y-2.5">
              {fitnessData?.domainStrengths &&
                Object.entries(fitnessData.domainStrengths).map(([dom, val]) => (
                  <div key={dom} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[#526766]">
                        {dom} Fraud Defense
                      </span>
                      <span className="font-mono font-bold text-[#183B3A]">
                        {val.score}% &bull; {val.label}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          val.score >= 80
                            ? 'bg-[#22C55E]'
                            : val.score >= 60
                            ? 'bg-[#38BDF8]'
                            : 'bg-[#F59E0B]'
                        }`}
                        style={{ width: `${val.score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recommendations & Weakest Domain Callout */}
          <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#176B61] uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span>Recommended Next Drill: {weakestDomain}</span>
              </div>
              <p className="text-xs text-[#526766] leading-relaxed">
                Your data indicates room for improvement in detecting subtle red flags in {weakestDomain.toLowerCase()}. Take a targeted drill to bolster your defenses.
              </p>
              {fitnessData?.recommendations && (
                <ul className="space-y-1 text-xs text-[#183B3A] pt-1">
                  {fitnessData.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0 mt-1.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => onNavigate('scenarios')}
              className="py-2 px-3 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start"
            >
              <span>Practice {weakestDomain}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scientific / Educational Progress Disclaimer */}
        <div className="pt-2 text-[11px] text-[#526766] italic border-t border-[#DCEBE7]/60">
          * Notice: The Cyber Fitness Score is an educational progress indicator designed to cultivate proactive fraud awareness and instinct. It does not constitute a legally certified guarantee against real-world zero-day security incidents.
        </div>
      </div>

      {/* 5-Domain Scan Counter Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#183B3A]">
            Platform Scans by Communication Vector
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#176B61] hover:text-[#183B3A] flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Audit Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#526766]">
              <span>Total Scans</span>
              <ShieldCheck className="w-4 h-4 text-[#176B61]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#183B3A] mt-2">
              {totalScans}
            </div>
            <div className="text-[10px] text-[#526766] mt-0.5">Audited payloads</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#526766]">
              <span>Email</span>
              <Mail className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#183B3A] mt-2">
              {emailScans}
            </div>
            <div className="text-[10px] text-[#526766] mt-0.5">Phishing &amp; BEC</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#526766]">
              <span>WhatsApp</span>
              <MessageSquare className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#183B3A] mt-2">
              {whatsappScans}
            </div>
            <div className="text-[10px] text-[#526766] mt-0.5">Forwards &amp; Tasks</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#526766]">
              <span>SMS</span>
              <Smartphone className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#183B3A] mt-2">
              {smsScans}
            </div>
            <div className="text-[10px] text-[#526766] mt-0.5">Smishing &amp; OTPs</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-[#526766]">
              <span>Web Links</span>
              <Globe className="w-4 h-4 text-[#176B61]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#183B3A] mt-2">
              {urlScans}
            </div>
            <div className="text-[10px] text-[#526766] mt-0.5">Domains &amp; IPs</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Scans & Quiz Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Scans */}
        <div className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCEBE7]">
            <h3 className="text-sm font-bold text-[#183B3A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#176B61]" />
              <span>Recent Scan History</span>
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#176B61] hover:underline cursor-pointer"
            >
              See all ({scans.length})
            </button>
          </div>

          {scans.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] flex items-center justify-center mx-auto text-[#526766]">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#183B3A]">No scans logged yet</div>
              <p className="text-[11px] text-[#526766] max-w-xs mx-auto">
                Paste any suspicious email, WhatsApp message, SMS, or URL into the scanner to generate your first audit record.
              </p>
              <button
                onClick={() => onNavigate('detection')}
                className="py-2 px-4 rounded-xl bg-[#38BDF8] text-white text-xs font-bold hover:bg-[#0EA5E9] shadow-xs cursor-pointer"
              >
                Start First Scan
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scans.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] hover:border-[#38BDF8] transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono uppercase font-bold text-[10px] text-[#176B61] px-1.5 py-0.5 rounded-md bg-white border border-[#DCEBE7]">
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.category === 'SAFE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.category === 'MODERATE'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[#183B3A] font-medium truncate max-w-xs sm:max-w-sm">
                      {item.preview || 'Analyzed threat payload'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs text-[#183B3A]">
                      Risk {item.risk_score}/100
                    </div>
                    <div className="text-[10px] text-[#526766]">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Performance */}
        <div className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCEBE7]">
            <h3 className="text-sm font-bold text-[#183B3A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#176B61]" />
              <span>Adaptive Quiz Results</span>
            </h3>
            <span className="text-xs font-mono text-[#526766]">
              {totalQuizzes} session{totalQuizzes === 1 ? '' : 's'} completed
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] flex items-center justify-center mx-auto text-[#526766]">
                <HelpCircle className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="text-xs font-bold text-[#183B3A]">No quizzes completed yet</div>
              <p className="text-[11px] text-[#526766] max-w-xs mx-auto">
                Test your instincts against real-world scam scenarios to establish your baseline accuracy and unlock personalized training.
              </p>
              <button
                onClick={() => onNavigate('scenarios')}
                className="py-2 px-4 rounded-xl bg-[#38BDF8] text-white text-xs font-bold hover:bg-[#0EA5E9] shadow-xs cursor-pointer"
              >
                Take 10-Question Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {quizzes.slice(0, 4).map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#183B3A]">
                      Score: {q.score} / {q.totalQuestions} correct
                    </div>
                    <div className="text-[10px] text-[#526766]">
                      Completed {new Date(q.completedAt).toLocaleDateString()} &bull; Mode: {q.mode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-[#176B61]">
                      {q.accuracy}%
                    </div>
                    <div className="text-[10px] text-[#526766]">Accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Earned Badges Strip */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#183B3A]">
              Earned Badges &amp; Accreditations
            </h3>
            <p className="text-xs text-[#526766]">
              Milestones achieved through defensive verification, scam forensic audits, and awareness tests.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#176B61] px-2.5 py-1 rounded-full bg-[#E8F8F5] border border-[#B8F2E6]">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-1">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                b.isUnlocked
                  ? 'bg-[#F7FCFA] border-[#B8F2E6] shadow-xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl mx-auto flex items-center justify-center ${
                  b.isUnlocked
                    ? 'bg-[#B8F2E6] text-[#176B61]'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#183B3A] line-clamp-1">
                {b.title}
              </div>
              <div className="text-[10px] text-[#526766] line-clamp-2 leading-tight">
                {b.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
