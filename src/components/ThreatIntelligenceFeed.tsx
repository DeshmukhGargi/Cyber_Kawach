import React, { useState, useEffect } from 'react';
import {
  Rss,
  ExternalLink,
  RefreshCw,
  Search,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ThreatFeedItem, ThreatSeverity, ContentType } from '../types/cyber.ts';
import { fetchThreatIntelligenceFeed } from '../services/api.ts';

interface ThreatIntelligenceFeedProps {
  onInspectInDetector?: (type: ContentType, content: string, subject?: string) => void;
}

export const ThreatIntelligenceFeed: React.FC<ThreatIntelligenceFeedProps> = ({
  onInspectInDetector,
}) => {
  const [items, setItems] = useState<ThreatFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchThreatIntelligenceFeed();
      setItems(data.items);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Unable to fetch threat intelligence feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const categories = [
    { id: 'all', label: 'All Intel' },
    { id: 'advisory', label: 'CISA & Security Advisories' },
    { id: 'news', label: 'Breaking Cyber News' },
    { id: 'phishing', label: 'Phishing & Fraud Campaigns' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category === selectedCategory ||
      (selectedCategory === 'advisory' && (item.category === 'vulnerability' || item.source === 'CISA Advisory'));

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query)) ||
      (item.cve_id && item.cve_id.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const getSeverityStyle = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'text-[#B91C1C] font-bold';
      case 'High':
        return 'text-[#EF4444] font-semibold';
      case 'Medium':
        return 'text-[#F59E0B] font-semibold';
      default:
        return 'text-slate-500 font-normal';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="threat-intelligence-feed" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DCEBE7]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#176B61] uppercase tracking-wider font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#38BDF8]" />
            <span>Live Threat Intelligence Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B3A]">
            Cyber Threat Advisories &amp; Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#526766] max-w-2xl leading-relaxed">
            Continuously updated real-world threat feeds sourced from reputable cybersecurity authorities including CISA Known Exploited Vulnerabilities and The Hacker News.
          </p>
        </div>

        {/* Live Status & Refresh Trigger */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-[#526766] tabular-nums hidden sm:inline">
              Refreshed: {lastRefreshed}
            </span>
          )}
          <button
            onClick={loadFeed}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#DCEBE7] hover:bg-[#E8F8F5] text-xs text-[#183B3A] transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : 'text-[#176B61]'}`} />
            <span>{loading ? 'Updating...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Segmented Control Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#DCEBE7] rounded-xl overflow-x-auto shadow-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus:outline-none cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#38BDF8] text-white font-bold shadow-xs'
                  : 'text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#526766] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter CVE, vendor, keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#DCEBE7] text-xs text-[#183B3A] placeholder-[#526766]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-rose-800">Failed to update live feed:</span>
            <p className="text-rose-700">{error}</p>
          </div>
          <button
            onClick={loadFeed}
            className="ml-auto text-xs underline text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#DCEBE7] animate-pulse space-y-3">
              <div className="h-4 bg-[#E8F8F5] rounded w-3/4" />
              <div className="h-3 bg-[#E8F8F5]/80 rounded w-1/2" />
              <div className="h-14 bg-[#F7FCFA] rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Feed Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-[#DCEBE7] hover:border-[#38BDF8] hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              {/* Unboxed Metadata Header */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#526766]">
                <span className="font-semibold text-[#183B3A]">{item.source}</span>
                <span aria-hidden="true">&middot;</span>
                <span className={getSeverityStyle(item.severity)}>
                  {item.severity} Severity
                </span>
                <span aria-hidden="true">&middot;</span>
                <span className="font-mono tabular-nums text-[#526766]">
                  {formatDate(item.published_at)}
                </span>
                {item.cve_id && (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span className="font-mono text-[#176B61] font-semibold">{item.cve_id}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-[#183B3A] hover:text-[#176B61] transition-colors leading-snug">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus:outline-none focus:underline"
                >
                  {item.title}
                </a>
              </h3>

              {/* Summary */}
              <p className="text-xs text-[#526766] leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Bottom Row: Tags & Direct Actions */}
            <div className="pt-3 border-t border-[#DCEBE7]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Tags */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#526766] font-mono">
                {item.tags.map((tag, idx) => (
                  <React.Fragment key={idx}>
                    <span>#{tag}</span>
                    {idx < item.tags.length - 1 && <span aria-hidden="true">/</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 ml-auto">
                {/* Inspect in Detector Shortcut */}
                {onInspectInDetector && (
                  <button
                    onClick={() =>
                      onInspectInDetector(
                        'email',
                        `Security Advisory Reference:\nTitle: ${item.title}\nSource: ${item.source}\nSummary: ${item.summary}\nAssociated URL/Target: ${item.source_url}`,
                        `Security Threat Check: ${item.title.substring(0, 50)}`
                      )
                    }
                    className="text-[11px] font-semibold text-[#176B61] hover:text-[#38BDF8] transition-colors flex items-center gap-1"
                    title="Scan indicators in Cyber Kawach Detection Engine"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Inspect Vectors</span>
                  </button>
                )}

                {/* Read Full Advisory */}
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-[#526766] hover:text-[#183B3A] transition-colors flex items-center gap-1"
                >
                  <span>Source Report</span>
                  <ExternalLink className="w-3 h-3 text-[#526766]" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-[#DCEBE7] text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-[#526766] mx-auto" />
          <h3 className="text-sm font-semibold text-[#183B3A]">
            No intelligence items matching "{searchQuery}"
          </h3>
          <p className="text-xs text-[#526766] max-w-sm mx-auto">
            Try adjusting your search keywords or switch to the &ldquo;All Intel&rdquo; category tab.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#E8F8F5] text-xs text-[#176B61] hover:bg-[#B8F2E6] font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
