import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileText,
  Clock,
  RefreshCw,
  Layers,
  LogIn,
  ShieldX,
} from 'lucide-react';
import {
  ScanHistoryRecord,
  getScanHistory,
  deleteScanRecord,
  clearAllScanHistory,
} from '../services/historyStorage.ts';
import {
  fetchUserScansFromFirestore,
  deleteUserScanFromFirestore,
  computeScanMetrics,
} from '../services/firestoreScanService.ts';
import { AnalysisResultCard } from '../components/AnalysisResultCard.tsx';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';
import { ContentType } from '../types/cyber.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface HistoryPageProps {
  onReopenScanInDetector: (type: ContentType, content: string, subject?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onReopenScanInDetector }) => {
  const { user, openLoginModal } = useAuth();

  const [history, setHistory] = useState<ScanHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedScan, setSelectedScan] = useState<ScanHistoryRecord | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadRecords = async () => {
    setLoadingHistory(true);
    try {
      if (user) {
        // Fetch personal cloud scans from Firestore
        const firestoreRecords = await fetchUserScansFromFirestore(user.uid);
        if (firestoreRecords.length > 0) {
          setHistory(firestoreRecords);
        } else {
          // Fall back to local records if fresh Firestore
          const localRecords = getScanHistory();
          setHistory(localRecords);
        }
      } else {
        // Guest mode reads from local device storage
        const records = getScanHistory();
        setHistory(records);
      }
    } catch (err) {
      console.warn('Error loading scan records:', err);
      setHistory(getScanHistory());
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      try {
        await deleteUserScanFromFirestore(user.uid, id);
      } catch (err) {
        console.warn('Error deleting scan from Firestore:', err);
      }
    }
    deleteScanRecord(id);
    loadRecords();
    if (selectedScan?.id === id) {
      setSelectedScan(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local scan history on this device?')) {
      clearAllScanHistory();
      setHistory([]);
      setSelectedScan(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyber-kawach-scan-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered list
  const filteredHistory = history.filter((item) => {
    const matchesFilter =
      riskFilter === 'all' ||
      (riskFilter === 'high' && (item.category === 'DO NOT TOUCH' || item.category === 'SCAM')) ||
      (riskFilter === 'moderate' && item.category === 'MODERATE') ||
      (riskFilter === 'safe' && item.category === 'SAFE');

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.preview.toLowerCase().includes(query) ||
      item.scam_type.toLowerCase().includes(query) ||
      (item.subject && item.subject.toLowerCase().includes(query));

    return matchesFilter && matchesQuery;
  });

  // Calculate real scan metrics from actual history data
  const metrics = computeScanMetrics(history);

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'DO NOT TOUCH':
        return {
          style: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-600',
        };
      case 'SCAM':
        return {
          style: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'MODERATE':
        return {
          style: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'SAFE':
      default:
        return {
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Background Watermark */}
      <div className="absolute top-1/3 right-0 opacity-[0.025] pointer-events-none hidden lg:block">
        <CyberKawachLogo size={500} variant="watermark" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] font-bold uppercase tracking-wider">
            <CyberKawachLogo size={16} variant="brand" />
            <span>Audit Trail &bull; User Security Log</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#183B3A] tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-[#38BDF8]" />
            <span>My Scan History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#526766]">
            {user
              ? `Cloud-synced scan ledger for ${user.email}. Only you can access your history.`
              : 'Review previously inspected messages, threat levels, and scam verdicts.'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={loadRecords}
            className="p-2.5 rounded-xl bg-white border border-[#DCEBE7] hover:bg-[#E8F8F5] text-[#183B3A] transition-colors shadow-xs cursor-pointer"
            title="Refresh Scan Records"
            aria-label="Refresh Scan Records"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>

          {history.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#DCEBE7] hover:bg-[#E8F8F5] text-[#183B3A] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#176B61]" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!user && (
        <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#183B3A]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>
              You are currently viewing guest scans stored on this device. Sign in to securely save and access your scan history anywhere.
            </span>
          </div>
          <button
            onClick={openLoginModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Sign Up</span>
          </button>
        </div>
      )}

      {/* Section 11: Real User Scan Count Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
        <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#526766] uppercase tracking-wider">
            Total Scans
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#183B3A] font-mono tabular-nums">
            {metrics.total}
          </div>
          <div className="text-[10px] text-[#526766]/70">Total requests logged</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Safe</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#22C55E] font-mono tabular-nums">
            {metrics.safe}
          </div>
          <div className="text-[10px] text-slate-400">Benign communications</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Moderate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F59E0B] font-mono tabular-nums">
            {metrics.moderate}
          </div>
          <div className="text-[10px] text-slate-400">Caution advised</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Scam</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#EF4444] font-mono tabular-nums">
            {metrics.scam}
          </div>
          <div className="text-[10px] text-slate-400">Fraud vectors caught</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono font-bold text-[#B91C1C] uppercase tracking-wider flex items-center gap-1">
            <ShieldX className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Do Not Touch</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#B91C1C] font-mono tabular-nums">
            {metrics.doNotTouch}
          </div>
          <div className="text-[10px] text-slate-400">Critical threat level</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved scans by text, scam type, or subject..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#DCEBE7] rounded-xl text-xs text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8]"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'high', label: 'Scam & Critical' },
            { id: 'moderate', label: 'Moderate' },
            { id: 'safe', label: 'Safe Only' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRiskFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                riskFilter === f.id
                  ? 'bg-[#38BDF8] text-white shadow-xs font-bold'
                  : 'bg-white text-[#526766] hover:bg-[#E8F8F5] border border-[#DCEBE7]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scans List / Detailed View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: Scrollable List of Scans */}
        <div className={selectedScan ? 'lg:col-span-6 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {filteredHistory.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-[#DCEBE7] text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8F5] border border-[#B8F2E6] text-[#176B61] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#183B3A]">
                  {history.length === 0 ? 'No scan records logged yet' : 'No scans match your search criteria'}
                </h3>
                <p className="text-xs text-[#526766] max-w-sm mx-auto">
                  {history.length === 0
                    ? 'Analyze suspicious URLs, SMS, emails, or WhatsApp messages in the Scan section to see your automated history records here.'
                    : 'Try clearing the search query or selecting "All Scans" to view more records.'}
                </p>
              </div>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const badge = getRiskBadge(item.category);
              const isSelected = selectedScan?.id === item.id;
              const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedScan(item)}
                  className={`p-4 sm:p-5 rounded-2xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F8F5] border-[#38BDF8] shadow-sm ring-2 ring-[#38BDF8]/20'
                      : 'bg-white border-[#DCEBE7] hover:border-[#38BDF8] hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-[#526766] border border-slate-200">
                        {item.type}
                      </span>

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${badge.style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{item.category}</span>
                      </span>

                      <span className="text-[11px] font-mono font-bold text-[#183B3A] ml-1">
                        Risk Score: {item.risk_score}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#526766]/70 hidden sm:inline">
                        {formattedDate}
                      </span>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scam Type Title */}
                  <h4 className="text-xs font-bold text-[#183B3A] mt-2.5">
                    {item.scam_type}
                  </h4>

                  {/* Summary / Preview */}
                  <p className="text-xs text-[#526766] line-clamp-2 mt-1 leading-relaxed font-sans">
                    {item.preview}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#DCEBE7]/60 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#526766]/70 sm:hidden">
                      {formattedDate}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReopenScanInDetector(item.type, item.preview, item.subject);
                      }}
                      className="text-[#176B61] hover:text-[#38BDF8] font-semibold flex items-center gap-1 ml-auto"
                    >
                      <span>Re-analyze in Scanner</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Scan Card Inspector */}
        {selectedScan && (
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#DCEBE7] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#183B3A]">Scan Finding Details</h3>
                <span className="text-[10px] font-mono text-[#526766]">ID: {selectedScan.id}</span>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-xs font-semibold text-[#526766] hover:text-[#183B3A]"
              >
                Close Inspector
              </button>
            </div>

            <AnalysisResultCard
              result={selectedScan.full_result}
              onReset={() => onReopenScanInDetector(selectedScan.type, selectedScan.preview, selectedScan.subject)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
