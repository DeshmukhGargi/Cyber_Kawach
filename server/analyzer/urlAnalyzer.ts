import type { UrlAnalysisDetail } from '../../src/types/cyber.ts';

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'loan', 'zip', 'mov', 'country', 'stream',
  'download', 'racing', 'accountant', 'gq', 'cf', 'tk', 'ml', 'ga', 'buzz',
  'rest', 'fit', 'party', 'date', 'faith', 'cricket', 'win', 'men'
]);

const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly',
  'rb.gy', 'cutt.ly', 'shorturl.at', 'bl.ink', 'v.gd', 'qr.ae'
]);

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'verification', 'update', 'kyc', 'pan', 'aadhaar',
  'secure', 'account', 'banking', 'sbi', 'hdfc', 'icici', 'otp', 'free',
  'reward', 'lottery', 'jackpot', 'prize', 'bonus', 'claim', 'refund',
  'wallet', 'gift', 'password', 'signin', 'support', 'helpdesk', 'unblock',
  'suspend', 'confirm', 'security', 'billing', 'urgent', 'portal', 'auth'
];

export function analyzeUrl(rawUrl: string): UrlAnalysisDetail {
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let protocol: 'http' | 'https' | 'unknown' = 'unknown';
  let domain = '';
  let pathname = '';
  let search = '';
  let port = '';

  try {
    const parsed = new URL(cleanUrl);
    protocol = parsed.protocol === 'http:' ? 'http' : parsed.protocol === 'https:' ? 'https' : 'unknown';
    domain = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
    search = parsed.search.toLowerCase();
    port = parsed.port;
  } catch {
    domain = cleanUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  }

  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain) || /^\[?[a-f0-9:]+\]?$/i.test(domain);

  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  const hasUrlShortener = SHORTENER_DOMAINS.has(domain);
  const subdomainCount = Math.max(0, parts.length - 2);

  const fullUrlString = `${domain}${pathname}${search}`;
  const keywordsFound: string[] = [];

  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (fullUrlString.includes(kw)) {
      keywordsFound.push(kw);
    }
  }

  const hasUnusualChars = /[@%_~]/.test(domain) || fullUrlString.includes('..') || /xn--/.test(domain);
  const hasPort = Boolean(port && port !== '80' && port !== '443');

  // Compute heuristic risk score for URL
  let score = 0;
  if (protocol === 'http') score += 25;
  if (isIpAddress) score += 45;
  if (hasSuspiciousTld) score += 30;
  if (hasUrlShortener) score += 25;
  if (subdomainCount >= 3) score += 20;
  if (hasUnusualChars) score += 20;
  if (hasPort) score += 15;
  score += Math.min(35, keywordsFound.length * 10);

  const heuristicScore = Math.min(100, Math.max(0, score));

  return {
    protocol,
    is_ip_address: isIpAddress,
    has_suspicious_tld: hasSuspiciousTld,
    tld,
    domain,
    has_url_shortener: hasUrlShortener,
    subdomain_count: subdomainCount,
    suspicious_keywords_found: Array.from(new Set(keywordsFound)),
    has_unusual_characters: hasUnusualChars,
    has_port: hasPort,
    heuristic_risk_score: heuristicScore,
  };
}
