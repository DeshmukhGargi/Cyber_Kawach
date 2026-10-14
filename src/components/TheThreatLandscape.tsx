import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  RefreshCw,
  Info,
  HelpCircle,
  ArrowRight,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ContentType, RiskCategory, QuizDomain } from '../types/cyber.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { getLiveScanRecords } from '../services/userActivityService.ts';
import { ScanHistoryRecord } from '../services/historyStorage.ts';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

interface TheThreatLandscapeProps {
  onTestDomain?: (domain: QuizDomain | 'payment') => void;
}

type DateRange = '7d' | '30d' | 'all';

interface DomainMetrics {
  type: ContentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  total: number;
  safe: number;
  moderate: number;
  scam: number;
  doNotTouch: number;
  suspicious: number; // scam + doNotTouch
  suspiciousRate: number | null; // null if total === 0
}

export const TheThreatLandscape: React.FC<TheThreatLandscapeProps> = ({ onTestDomain }) => {
  const { user } = useAuth();
  const [allScans, setAllScans] = useState<ScanHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [hoveredDomainBar, setHoveredDomainBar] = useState<ContentType | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);

  // Load real scan records from Firestore (if user logged in) and LocalStorage
  const loadScanData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setLoading(true);

    try {
      const records = await getLiveScanRecords(user ? user.uid : null);
      setAllScans(records);
    } catch (err) {
      console.warn('Failed to load real scan telemetry:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadScanData();

    // Listen for custom scan event dispatched when a scan is performed
    const handleScanUpdated = () => {
      loadScanData(false);
    };

    window.addEventListener('scan_history_updated', handleScanUpdated);
    window.addEventListener('storage', handleScanUpdated);

    return () => {
      window.removeEventListener('scan_history_updated', handleScanUpdated);
      window.removeEventListener('storage', handleScanUpdated);
    };
  }, [user]);

  // Filter scans based on selected date range
  const filteredScans = useMemo(() => {
    if (dateRange === 'all') return allScans;
    const now = Date.now();
    const days = dateRange === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return allScans.filter((s) => {
      const t = new Date(s.timestamp).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  }, [allScans, dateRange]);

  // Compute metrics per domain based on real data
  const domainMetrics: Record<ContentType, DomainMetrics> = useMemo(() => {
    const initDomain = (type: ContentType, label: string, icon: any): DomainMetrics => ({
      type,
      label,
      icon,
      total: 0,
      safe: 0,
      moderate: 0,
      scam: 0,
      doNotTouch: 0,
      suspicious: 0,
      suspiciousRate: null,
    });

    const metrics: Record<ContentType, DomainMetrics> = {
      email: initDomain('email', 'Email Phishing', Mail),
      whatsapp: initDomain('whatsapp', 'WhatsApp Scams', MessageSquare),
      sms: initDomain('sms', 'SMS Smishing', Smartphone),
      url: initDomain('url', 'Malicious URLs', Globe),
    };

    filteredScans.forEach((scan) => {
      const target = metrics[scan.type];
      if (target) {
        target.total += 1;
        const cat = scan.category;
        if (cat === 'SAFE') target.safe += 1;
        else if (cat === 'MODERATE') target.moderate += 1;
        else if (cat === 'SCAM') {
          target.scam += 1;
          target.suspicious += 1;
        } else if (cat === 'DO NOT TOUCH') {
          target.doNotTouch += 1;
          target.suspicious += 1;
        }
      }
    });

    (['email', 'whatsapp', 'sms', 'url'] as ContentType[]).forEach((t) => {
      const m = metrics[t];
      if (m.total > 0) {
        m.suspiciousRate = Math.round((m.suspicious / m.total) * 1000) / 10;
      } else {
        m.suspiciousRate = null;
      }
    });

    return metrics;
  }, [filteredScans]);

  const totalFilteredScans = filteredScans.length;

  // Graph 1: Determine Most-Used Domain based on real data
  const mostUsedData = useMemo(() => {
    const list = Object.values(domainMetrics);
    const maxVal = Math.max(...list.map((d) => d.total));
    if (maxVal === 0) return null;
    const leaders = list.filter((d) => d.total === maxVal);
    return {
      leaders,
      count: maxVal,
      percentage: totalFilteredScans > 0 ? Math.round((maxVal / totalFilteredScans) * 100) : 0,
      isTied: leaders.length > 1,
    };
  }, [domainMetrics, totalFilteredScans]);

  // Graph 3: Calculate daily scan counts for the last 7 calendar days
  const last7DaysData = useMemo(() => {
    const days: { dateStr: string; label: string; shortDay: string; count: number }[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayScans = allScans.filter((scan) => {
        const scanTime = new Date(scan.timestamp).getTime();
        return !isNaN(scanTime) && scanTime >= startOfDay.getTime() && scanTime <= endOfDay.getTime();
      });

      days.push({
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        shortDay: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: dayScans.length,
      });
    }

    // Trend calculation: compare last 3 days (days 4, 5, 6) vs prior 3 days (days 1, 2, 3)
    const recentSum = days[4].count + days[5].count + days[6].count;
    const previousSum = days[1].count + days[2].count + days[3].count;
    let trendDirection: 'up' | 'down' | 'steady' = 'steady';
    let trendDiff = 0;

    if (recentSum > previousSum) {
      trendDirection = 'up';
      trendDiff = recentSum - previousSum;
    } else if (recentSum < previousSum) {
      trendDirection = 'down';
      trendDiff = previousSum - recentSum;
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);

    return {
      days,
      trendDirection,
      trendDiff,
      recentSum,
      previousSum,
      maxCount,
    };
  }, [allScans]);

  return (
    <section id="threat-landscape" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
      {/* SECTION HEADER & REAL-TIME CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#DCEBE7]">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#DCEBE7] text-xs font-mono text-[#176B61] font-bold shadow-xs">
            <CyberKawachLogo size={16} variant="brand" />
            <span className="uppercase tracking-wider">Live Platform Analytics</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#183B3A]">
            The Cyber Threat Landscape
          </h2>
          <p className="text-xs sm:text-sm text-[#526766] leading-relaxed">
            Real-time analytics and threat patterns aggregated directly from verified payload scans conducted across Email, WhatsApp, SMS, and URL inspection vectors.
          </p>
        </div>

        {/* CONTROLS: Date Range Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-end">
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#DCEBE7] shadow-xs text-xs font-medium text-[#526766]">
            <Calendar className="w-3.5 h-3.5 text-[#176B61] ml-2 mr-1.5" />
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateRange === '7d'
                  ? 'bg-[#176B61] text-white font-bold shadow-xs'
                  : 'hover:text-[#183B3A] hover:bg-[#F7FCFA]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateRange === '30d'
                  ? 'bg-[#176B61] text-white font-bold shadow-xs'
                  : 'hover:text-[#183B3A] hover:bg-[#F7FCFA]'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateRange === 'all'
                  ? 'bg-[#176B61] text-white font-bold shadow-xs'
                  : 'hover:text-[#183B3A] hover:bg-[#F7FCFA]'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => loadScanData(true)}
            disabled={isRefreshing || loading}
            title="Refresh scan metrics"
            className="p-2.5 rounded-xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] text-[#176B61] transition-all hover:bg-[#F7FCFA] shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* QUICK AGGREGATE SUMMARY STRIP */}
      {totalFilteredScans > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] text-[#176B61] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-[#183B3A]">
                {totalFilteredScans}
              </div>
              <div className="text-[11px] text-[#526766] font-medium">Scans In Period</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-700">
                {Object.values(domainMetrics).reduce((acc, d) => acc + d.safe, 0)}
              </div>
              <div className="text-[11px] text-[#526766] font-medium">Safe Payloads</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-red-700">
                {Object.values(domainMetrics).reduce((acc, d) => acc + d.suspicious, 0)}
              </div>
              <div className="text-[11px] text-[#526766] font-medium">Flagged Threats</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black font-mono text-[#176B61]">
                {Object.values(domainMetrics).filter((d) => d.total > 0).length} / 4
              </div>
              <div className="text-[11px] text-[#526766] font-medium">Active Channels</div>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs animate-pulse h-80 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-5 w-1/3 bg-slate-100 rounded-lg" />
                <div className="h-3 w-1/2 bg-slate-50 rounded" />
              </div>
              <div className="h-44 bg-slate-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : totalFilteredScans === 0 ? (
        /* INFORMATIVE EMPTY STATE (WHEN NO SCAN DATA EXISTS YET) */
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#E8F8F5] border border-[#B8F2E6] flex items-center justify-center text-[#176B61] shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#183B3A]">
              Not enough scan data yet
            </h3>
            <p className="text-xs sm:text-sm text-[#526766] max-w-lg mx-auto leading-relaxed">
              No payload scans have been submitted {dateRange !== 'all' ? 'in this timeframe' : 'yet'}. Real graph analytics for Domain Usage, Detection Results, 7-Day Activity, and Channel Detection Rates will populate automatically as you scan suspicious items.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] text-left text-xs text-[#526766] grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#176B61] shrink-0 mt-1" />
              <span><strong>Graph 1:</strong> Tracks domain frequency across Email, WhatsApp, SMS, &amp; URLs.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
              <span><strong>Graph 2:</strong> Visualizes Safe vs Moderate vs Scam vs Do Not Touch breakdowns.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-1" />
              <span><strong>Graph 3:</strong> Evaluates 7-day volume velocity and directional attack trends.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
              <span><strong>Graph 4:</strong> Measures suspicious threat rates without simulated numbers.</span>
            </div>
          </div>

          {onTestDomain && (
            <div className="pt-2">
              <button
                onClick={() => onTestDomain('email')}
                className="px-6 py-3 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer"
              >
                <span>Perform Your First Threat Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 4 MODERN RESPONSIVE GRAPHS DASHBOARD */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ======================================================== */}
          {/* GRAPH 1: DOMAIN USAGE ("Which Domain Is Used Most?")     */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#B8F2E6] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B61] font-bold">
                  Vector Telemetry
                </span>
                {mostUsedData && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F8F5] border border-[#B8F2E6] text-[11px] font-mono font-bold text-[#176B61]">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      {mostUsedData.isTied ? 'Tied Leaders: ' : 'Most Used: '}
                      {mostUsedData.leaders.map((l) => l.label.split(' ')[0]).join(' & ')} ({mostUsedData.count})
                    </span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#183B3A]">
                Which Domain Is Used Most?
              </h3>
              <p className="text-xs text-[#526766]">
                Comparison of actual scan volumes submitted across the four supported inspection vectors.
              </p>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4 pt-1">
              {(['email', 'whatsapp', 'sms', 'url'] as ContentType[]).map((type) => {
                const metric = domainMetrics[type];
                const Icon = metric.icon;
                const isLeader = mostUsedData && mostUsedData.leaders.some((l) => l.type === type) && metric.total > 0;
                const pctOfTotal = totalFilteredScans > 0 ? Math.round((metric.total / totalFilteredScans) * 100) : 0;
                const maxVal = mostUsedData ? Math.max(mostUsedData.count, 1) : 1;
                const barWidth = `${Math.max((metric.total / maxVal) * 100, metric.total > 0 ? 5 : 0)}%`;

                return (
                  <div
                    key={type}
                    onMouseEnter={() => setHoveredDomainBar(type)}
                    onMouseLeave={() => setHoveredDomainBar(null)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer ${
                      isLeader
                        ? 'bg-[#F7FCFA] border border-[#176B61]/30 ring-1 ring-[#176B61]/20'
                        : 'bg-white hover:bg-[#F7FCFA] border border-slate-100 hover:border-[#DCEBE7]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isLeader ? 'bg-[#176B61] text-white shadow-xs' : 'bg-slate-100 text-[#526766]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#183B3A] flex items-center gap-1.5">
                            <span>{metric.label}</span>
                            {isLeader && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8F8F5] text-[#176B61] font-semibold border border-[#B8F2E6]">
                                Top Vector
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-baseline gap-1.5">
                        <span className="font-mono text-sm font-black text-[#183B3A]">
                          {metric.total}
                        </span>
                        <span className="text-[10px] font-mono text-[#526766]">
                          ({pctOfTotal}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLeader
                            ? 'bg-gradient-to-r from-[#176B61] to-[#38BDF8]'
                            : 'bg-gradient-to-r from-slate-400 to-[#176B61]/60'
                        }`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Caption */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#526766]">
              <span>Denominator: {totalFilteredScans} verified scan records</span>
              <span className="font-mono text-[#176B61] font-bold">100% Real User Data</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* GRAPH 2: DETECTION RESULTS BY DOMAIN (Stacked Bar Chart) */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#B8F2E6] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B61] font-bold">
                  Classification Breakdown
                </span>
              </div>
              <h3 className="text-lg font-black text-[#183B3A]">
                Detection Results by Domain
              </h3>
              <p className="text-xs text-[#526766]">
                Distribution of scan outcomes categorized into Safe, Moderate, Scam, and Do Not Touch.
              </p>
            </div>

            {/* Status Color Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium p-2.5 rounded-xl bg-[#F7FCFA] border border-[#DCEBE7]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[#183B3A]">Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#183B3A]">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-[#183B3A]">Scam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
                <span className="text-[#183B3A]">Do Not Touch</span>
              </div>
            </div>

            {/* Stacked Bars per Domain */}
            <div className="space-y-4">
              {(['email', 'whatsapp', 'sms', 'url'] as ContentType[]).map((type) => {
                const metric = domainMetrics[type];
                const Icon = metric.icon;
                const total = metric.total;

                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#176B61]" />
                        <span className="font-bold text-[#183B3A]">{metric.label}</span>
                      </div>
                      <span className="font-mono text-[#526766] text-[11px]">
                        {total > 0 ? `${total} scans` : 'No scans'}
                      </span>
                    </div>

                    {total === 0 ? (
                      <div className="w-full h-4 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        0 scan entries
                      </div>
                    ) : (
                      <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner group">
                        {metric.safe > 0 && (
                          <div
                            style={{ width: `${(metric.safe / total) * 100}%` }}
                            title={`Safe: ${metric.safe} (${Math.round((metric.safe / total) * 100)}%)`}
                            className="bg-[#10B981] h-full transition-all hover:opacity-85"
                          />
                        )}
                        {metric.moderate > 0 && (
                          <div
                            style={{ width: `${(metric.moderate / total) * 100}%` }}
                            title={`Moderate: ${metric.moderate} (${Math.round((metric.moderate / total) * 100)}%)`}
                            className="bg-[#F59E0B] h-full transition-all hover:opacity-85"
                          />
                        )}
                        {metric.scam > 0 && (
                          <div
                            style={{ width: `${(metric.scam / total) * 100}%` }}
                            title={`Scam: ${metric.scam} (${Math.round((metric.scam / total) * 100)}%)`}
                            className="bg-[#EF4444] h-full transition-all hover:opacity-85"
                          />
                        )}
                        {metric.doNotTouch > 0 && (
                          <div
                            style={{ width: `${(metric.doNotTouch / total) * 100}%` }}
                            title={`Do Not Touch: ${metric.doNotTouch} (${Math.round((metric.doNotTouch / total) * 100)}%)`}
                            className="bg-[#991B1B] h-full transition-all hover:opacity-85"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Details Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#526766]">
              <span>Hover over stacked bar sections for exact counts</span>
              <span className="font-mono text-[#176B61]">Mapped strictly to detection categories</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* GRAPH 3: SCAN ACTIVITY OVER TIME (7-Day Line Chart)      */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#B8F2E6] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B61] font-bold">
                  Time-Series Velocity
                </span>
                {/* Trend Direction Pill */}
                {last7DaysData.trendDirection === 'up' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Activity Trending Up (+{last7DaysData.trendDiff})</span>
                  </span>
                )}
                {last7DaysData.trendDirection === 'down' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-mono font-bold text-amber-700">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Activity Decreasing (-{last7DaysData.trendDiff})</span>
                  </span>
                )}
                {last7DaysData.trendDirection === 'steady' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold text-slate-700">
                    <Activity className="w-3.5 h-3.5 text-[#176B61]" />
                    <span>Activity Steady</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#183B3A]">
                Scan Activity Over Time (Last 7 Days)
              </h3>
              <p className="text-xs text-[#526766]">
                Daily scan counts plotted using actual record timestamps. Missing days are logged as zero.
              </p>
            </div>

            {/* Line Chart SVG */}
            <div className="relative pt-2">
              <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#176B61" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#176B61" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis Horizontal Gridlines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = 140 - ratio * 110;
                  const val = Math.round(ratio * last7DaysData.maxCount);
                  return (
                    <g key={idx}>
                      <line
                        x1="30"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={ratio > 0 ? '4 4' : undefined}
                      />
                      <text
                        x="24"
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94A3B8"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Compute Points for Line and Area */}
                {(() => {
                  const pts = last7DaysData.days.map((day, idx) => {
                    const x = 50 + idx * ((480 - 50) / 6);
                    const y = 140 - (day.count / last7DaysData.maxCount) * 110;
                    return { x, y, ...day };
                  });

                  const linePath = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                  const areaPath = `${linePath} L ${pts[pts.length - 1].x} 140 L ${pts[0].x} 140 Z`;

                  return (
                    <>
                      {/* Gradient Fill Area */}
                      <path d={areaPath} fill="url(#cyberAreaGrad)" />

                      {/* Main Stroke Line */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#176B61"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Circles & Interactivity */}
                      {pts.map((p, idx) => {
                        const isHovered = hoveredDayIndex === idx;
                        return (
                          <g
                            key={idx}
                            onMouseEnter={() => setHoveredDayIndex(idx)}
                            onMouseLeave={() => setHoveredDayIndex(null)}
                            className="cursor-pointer"
                          >
                            {/* Hover Vertical Guide Line */}
                            {isHovered && (
                              <line
                                x1={p.x}
                                y1="30"
                                x2={p.x}
                                y2="140"
                                stroke="#38BDF8"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Circle Point */}
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isHovered ? 6 : 4}
                              fill={isHovered ? '#38BDF8' : '#176B61'}
                              stroke="#FFFFFF"
                              strokeWidth={isHovered ? 2.5 : 2}
                              className="transition-all"
                            />

                            {/* Tooltip on Hover */}
                            {isHovered && (
                              <g transform={`translate(${Math.min(Math.max(p.x, 60), 440)}, ${Math.max(p.y - 30, 20)})`}>
                                <rect
                                  x="-45"
                                  y="-18"
                                  width="90"
                                  height="24"
                                  rx="6"
                                  fill="#183B3A"
                                  className="shadow-md"
                                />
                                <text
                                  x="0"
                                  y="-2"
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#FFFFFF"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {p.count} {p.count === 1 ? 'scan' : 'scans'}
                                </text>
                              </g>
                            )}

                            {/* X Axis Label */}
                            <text
                              x={p.x}
                              y="160"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748B"
                              fontWeight={isHovered ? 'bold' : 'normal'}
                            >
                              {p.shortDay}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Bottom Caption */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#526766]">
              <span>7-day span: {last7DaysData.days[0].label} – {last7DaysData.days[6].label}</span>
              <span className="font-mono text-[#176B61] font-bold">
                Total: {last7DaysData.days.reduce((a, b) => a + b.count, 0)} scans
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* GRAPH 4: DOMAIN DETECTION RATE (Suspicious-Result %)      */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#B8F2E6] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#176B61] font-bold">
                  Threat Ratio Comparison
                </span>
                <span className="text-[10px] font-mono text-[#526766] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Formula: (Scam + Do Not Touch) / Total × 100
                </span>
              </div>
              <h3 className="text-lg font-black text-[#183B3A]">
                Domain Suspicious Detection Rate
              </h3>
              <p className="text-xs text-[#526766]">
                Percentage of scans submitted to Cyber Kawach that were flagged as Scam or Do Not Touch.
              </p>
            </div>

            {/* 4 Vector Gauge Bars */}
            <div className="space-y-4 pt-1">
              {(['email', 'whatsapp', 'sms', 'url'] as ContentType[]).map((type) => {
                const metric = domainMetrics[type];
                const Icon = metric.icon;
                const hasScans = metric.total > 0;
                const rate = metric.suspiciousRate;

                // Color code by severity
                let barColor = 'bg-slate-200';
                let textColor = 'text-slate-400';
                if (hasScans && rate !== null) {
                  if (rate > 60) {
                    barColor = 'bg-red-500';
                    textColor = 'text-red-700';
                  } else if (rate > 25) {
                    barColor = 'bg-amber-500';
                    textColor = 'text-amber-700';
                  } else {
                    barColor = 'bg-emerald-500';
                    textColor = 'text-emerald-700';
                  }
                }

                return (
                  <div
                    key={type}
                    className="p-3 rounded-2xl bg-[#F7FCFA] border border-[#DCEBE7] space-y-2 hover:border-[#38BDF8] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#176B61]" />
                        <span className="text-xs font-bold text-[#183B3A]">{metric.label}</span>
                      </div>

                      <div className="text-right">
                        {hasScans && rate !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-sm font-black ${textColor}`}>
                              {rate}%
                            </span>
                            <span className="text-[10px] font-mono text-[#526766]">
                              ({metric.suspicious}/{metric.total})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 italic">
                            N/A (0 scans recorded)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      {hasScans && rate !== null ? (
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.max(rate, 4)}%` }}
                        />
                      ) : (
                        <div className="h-full w-0 bg-transparent" />
                      )}
                    </div>

                    <div className="text-[10px] text-[#526766] flex items-center justify-between">
                      <span>
                        {hasScans
                          ? `${metric.suspicious} threat flags out of ${metric.total} total payloads`
                          : 'Excluded: Requires at least 1 scan'}
                      </span>
                      {hasScans && (
                        <span className="font-mono text-[#176B61] font-semibold">
                          {metric.safe} Safe verified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Crucial Transparency Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#183B3A] space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wide">
                <Info className="w-3 h-3 text-amber-600" />
                <span>Telemetry Context:</span>
              </div>
              <p className="text-[11px] text-[#526766] leading-relaxed">
                This detection rate reflects only scans submitted to Cyber Kawach and does not represent real-world national scam prevalence. Channels with zero scans are excluded from rate calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CTA STRIP: Jump to Scan or Test Knowledge */}
      {onTestDomain && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8F5] text-[#176B61] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#183B3A]">
                Want to test your ability to spot these vectors?
              </div>
              <div className="text-[11px] text-[#526766]">
                Explore realistic simulation drills and earn your Cyber Fitness Score.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onTestDomain('email')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#176B61] hover:bg-[#183B3A] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Test Your Knowledge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
