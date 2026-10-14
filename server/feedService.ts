import type { ThreatFeedItem, ThreatIntelligenceResponse, ThreatSeverity } from '../src/types/cyber.ts';

interface CacheEntry {
  timestamp: number;
  data: ThreatIntelligenceResponse;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function cleanHtml(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function determineSeverity(text: string): ThreatSeverity {
  const lower = text.toLowerCase();
  if (lower.includes('critical') || lower.includes('zero-day') || lower.includes('0-day') || lower.includes('ransomware') || lower.includes('actively exploit')) {
    return 'Critical';
  }
  if (lower.includes('high') || lower.includes('remote code execution') || lower.includes('rce') || lower.includes('privilege escalation') || lower.includes('backdoor')) {
    return 'High';
  }
  if (lower.includes('moderate') || lower.includes('medium') || lower.includes('phishing') || lower.includes('spoof')) {
    return 'Medium';
  }
  return 'Informational';
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes('ransomware')) tags.push('Ransomware');
  if (lower.includes('phishing') || lower.includes('credential')) tags.push('Phishing');
  if (lower.includes('zero-day') || lower.includes('0-day')) tags.push('Zero-Day');
  if (lower.includes('cve-')) {
    const cveMatch = text.match(/CVE-\d{4}-\d+/i);
    if (cveMatch) tags.push(cveMatch[0].toUpperCase());
  }
  if (lower.includes('cloud') || lower.includes('aws') || lower.includes('azure')) tags.push('Cloud Security');
  if (lower.includes('ai ') || lower.includes('llm') || lower.includes('model')) tags.push('AI Safety');
  if (lower.includes('banking') || lower.includes('upi') || lower.includes('financial')) tags.push('Financial Fraud');
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) tags.push('Mobile Threat');

  return tags.length > 0 ? tags.slice(0, 3) : ['Cyber Defense'];
}

export async function fetchThreatIntelligence(): Promise<ThreatIntelligenceResponse> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const items: ThreatFeedItem[] = [];
  let thnSuccess = false;
  let cisaSuccess = false;

  // 1. Fetch The Hacker News RSS
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const thnRes = await fetch('https://feeds.feedburner.com/TheHackersNews', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CyberKawach-ThreatIntel/1.0',
        Accept: 'application/rss+xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (thnRes.ok) {
      const xml = await thnRes.text();
      const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (let i = 0; i < Math.min(10, itemBlocks.length); i++) {
        const block = itemBlocks[i];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = block.match(/<description>([\s\S]*?)<\/description>/);
        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
        const link = linkMatch ? cleanHtml(linkMatch[1]) : '';
        const description = descMatch ? cleanHtml(descMatch[1]) : '';
        const pubDate = pubDateMatch ? cleanHtml(pubDateMatch[1]) : new Date().toISOString();

        if (title) {
          const category = title.toLowerCase().includes('phishing') || description.toLowerCase().includes('phishing')
            ? 'phishing'
            : title.toLowerCase().includes('flaw') || title.toLowerCase().includes('vulnerability')
            ? 'vulnerability'
            : 'news';

          items.push({
            id: `thn-${i}-${title.substring(0, 20).replace(/\W+/g, '')}`,
            title,
            summary: description.length > 220 ? description.substring(0, 220) + '...' : description,
            source: 'The Hacker News',
            source_url: link,
            category,
            published_at: pubDate,
            severity: determineSeverity(title + ' ' + description),
            tags: extractTags(title + ' ' + description),
          });
        }
      }
      thnSuccess = items.length > 0;
    }
  } catch (err) {
    console.warn('Failed to fetch The Hacker News RSS, continuing with other sources:', err);
  }

  // 2. Fetch CISA Known Exploited Vulnerabilities Catalog
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const cisaRes = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CyberKawach-ThreatIntel/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (cisaRes.ok) {
      const data = await cisaRes.json();
      if (Array.isArray(data.vulnerabilities)) {
        const recentVulns = data.vulnerabilities.slice(0, 8);
        for (let i = 0; i < recentVulns.length; i++) {
          const v = recentVulns[i];
          const cve = v.cveID || 'CVE';
          const title = `${v.vendorProject} ${v.product}: ${v.vulnerabilityName}`;
          const summary = `${v.shortDescription} Required Action: ${v.requiredAction || 'Apply vendor patch'}`;

          items.push({
            id: `cisa-${cve}-${i}`,
            title,
            summary: summary.length > 220 ? summary.substring(0, 220) + '...' : summary,
            source: 'CISA Advisory',
            source_url: `https://nvd.nist.gov/vuln/detail/${cve}`,
            category: 'advisory',
            published_at: v.dateAdded || new Date().toISOString().split('T')[0],
            severity: 'Critical',
            cve_id: cve,
            tags: [cve, v.vendorProject, 'Active Exploitation'],
          });
        }
        cisaSuccess = recentVulns.length > 0;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch CISA KEV catalog:', err);
  }

  // Fallback curated alerts if external APIs had network blocks
  if (items.length === 0) {
    items.push(
      {
        id: 'fb-1',
        title: 'Global Alert: New Phishing Campaign Exploits WhatsApp and Web Portals with Fake KYC Lures',
        summary: 'Security researchers observe aggressive smishing and WhatsApp message clusters impersonating national bank KYC portals to harvest NetBanking credentials and biometric proofs.',
        source: 'CERT Intelligence',
        source_url: 'https://cybercrime.gov.in',
        category: 'phishing',
        published_at: new Date().toISOString(),
        severity: 'Critical',
        tags: ['Phishing', 'Fake KYC', 'Mobile Threat'],
      },
      {
        id: 'fb-2',
        title: 'CISA Issues Guidance on Protecting Against Voice Phishing (Vishing) & Digital Arrest Scams',
        summary: 'Law enforcement and cyber defense authorities warn against callers posing as federal agents or CBI officials threatening fake warrants over continuous video calls.',
        source: 'CISA Advisory',
        source_url: 'https://www.cisa.gov',
        category: 'advisory',
        published_at: new Date().toISOString(),
        severity: 'High',
        tags: ['Social Engineering', 'Extortion', 'Digital Arrest'],
      },
      {
        id: 'fb-3',
        title: 'Critical RCE Flaws Weaponized via Malicious Shortened URL Redirections',
        summary: 'Threat groups disguise malicious command payloads through chained URL shorteners to evade gateway reputation checks.',
        source: 'The Hacker News',
        source_url: 'https://thehackernews.com',
        category: 'vulnerability',
        published_at: new Date().toISOString(),
        severity: 'High',
        tags: ['Zero-Day', 'URL Security'],
      }
    );
  }

  // Sort by date / priority
  const result: ThreatIntelligenceResponse = {
    success: true,
    total: items.length,
    last_updated: new Date().toISOString(),
    source_status: {
      cisa: cisaSuccess,
      thn: thnSuccess,
    },
    items,
  };

  cache = {
    timestamp: now,
    data: result,
  };

  return result;
}
