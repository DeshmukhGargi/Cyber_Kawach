import type { AnalysisResponse, ContentType, RiskCategory, ThreatLevel } from '../../src/types/cyber.ts';
import { analyzeUrl } from './urlAnalyzer.ts';

export interface RuleMatch {
  ruleId: string;
  name: string;
  weight: number;
  indicator: string;
  recommendation?: string;
  detectedScamType?: string;
}

const RULES: { id: string; name: string; pattern: RegExp; weight: number; indicator: string; rec?: string; scamType?: string }[] = [
  {
    id: 'BANK_ACCOUNT_BLOCKED',
    name: 'Bank Account Block Threat',
    pattern: /(account\s*(will\s*be|is)\s*(blocked|suspended|freez|deactivat)|deactivated\s*within|suspend\s*your\s*account)/i,
    weight: 35,
    indicator: 'Immediate threat of bank account block or suspension',
    rec: 'Never click links in account suspension warnings; verify directly through your official banking app.',
    scamType: 'Banking Impersonation & Phishing'
  },
  {
    id: 'KYC_PAN_AADHAAR',
    name: 'KYC / PAN / Aadhaar Expiry Threat',
    pattern: /(kyc\s*(pending|expired|verification|update)|pan\s*card\s*(blocked|linked)|aadhaar\s*(linked|update)|complete\s*your\s*kyc)/i,
    weight: 35,
    indicator: 'Demands urgent KYC or PAN/Aadhaar compliance via unofficial link',
    rec: 'Banks and financial entities never ask to update KYC via external SMS or WhatsApp links.',
    scamType: 'Fake KYC Phishing'
  },
  {
    id: 'URGENT_DEADLINE',
    name: 'Artificial Urgency Deadline',
    pattern: /(immediately|within\s*24\s*hours|urgent|action\s*required|before\s*(today|midnight|tonight)|last\s*warning)/i,
    weight: 20,
    indicator: 'High-pressure urgency tactics pushing for unthinking immediate reaction',
    rec: 'Scammers exploit psychological panic. Take a breath and independently verify.'
  },
  {
    id: 'UPI_COLLECT_FRAUD',
    name: 'UPI / QR Code Fraud Attempt',
    pattern: /(scan\s*qr\s*(to\s*receive|and\s*get)|enter\s*upi\s*pin\s*to\s*receive|send\s*money\s*request|collect\s*request|payment\s*of\s*rs)/i,
    weight: 45,
    indicator: 'UPI PIN / QR code exploit (You NEVER enter a PIN to receive money)',
    rec: 'Entering your UPI PIN or scanning a QR code ALWAYS transfers money OUT of your account.',
    scamType: 'UPI Fraud'
  },
  {
    id: 'OTP_CREDENTIAL_THEFT',
    name: 'OTP or Password Demands',
    pattern: /(share\s*(otp|one\s*time\s*password|pin|cvv|password)|send\s*the\s*code|verify\s*otp|forward\s*sms)/i,
    weight: 45,
    indicator: 'Explicit request for sensitive authentication secrets (OTP, PIN, CVV)',
    rec: 'Never share OTPs, CVVs, or PINs with anyone, even if they claim to be bank officials or police.',
    scamType: 'Credential & OTP Harvesting'
  },
  {
    id: 'LOTTERY_PRIZE_FRAUD',
    name: 'Fake Lottery / Cash Prize Claim',
    pattern: /(congratulations|you\s*have\s*won|won\s*(a\s*prize|lucky\s*draw|lottery|crores?|lakhs?)|claim\s*(your\s*reward|prize))/i,
    weight: 35,
    indicator: 'Unsolicited notification claiming unexpected lottery or prize jackpot',
    rec: 'If you did not enter a contest, you did not win. Do not pay any "processing fee" or "customs tax".',
    scamType: 'Advance-Fee Lottery Scam'
  },
  {
    id: 'ELECTRICITY_DISCONNECTION',
    name: 'Electricity / Utility Cut-off Scam',
    pattern: /(electricity\s*power\s*will\s*be\s*disconnect|power\s*will\s*be\s*disconnected\s*tonight|electricity\s*officer|bill\s*unpaid)/i,
    weight: 40,
    indicator: 'Fraudulent utility disconnection alert prompting calls to a fake officer number',
    rec: 'Utility providers do not send disconnection threats via mobile phone numbers with personal contact numbers.',
    scamType: 'Utility Disconnection Scam'
  },
  {
    id: 'JOB_TASK_FRAUD',
    name: 'Part-Time / Telegram Task Scam',
    pattern: /(part[\s-]time\s*job|earn\s*(daily|\$|\u20B9)\s*\d+|like\s*youtube\s*videos|telegram\s*(task|group)|work\s*from\s*home\s*earn)/i,
    weight: 35,
    indicator: 'High-payout easy work-from-home or Telegram task scheme',
    rec: 'Legitimate employers never require payment for "job registration", "crypto investment", or "task deposit".',
    scamType: 'Part-Time Task / Employment Fraud'
  },
  {
    id: 'REMOTE_ACCESS_APP',
    name: 'Remote Access Tool Installation',
    pattern: /(install\s*(anydesk|teamviewer|rustdesk|quicksupport)|download\s*app\s*for\s*support)/i,
    weight: 50,
    indicator: 'Coercing victim to install screen-sharing or remote desktop applications',
    rec: 'Never install AnyDesk, TeamViewer, or QuickSupport on instructions from callers or message senders.',
    scamType: 'Remote Device Hijacking'
  },
  {
    id: 'DIGITAL_ARREST_POLICE',
    name: 'Digital Arrest / Legal Coercion',
    pattern: /(digital\s*arrest|cyber\s*crime\s*department|cbi|customs\s*officer|courier\s*drugs|arrest\s*warrant|supreme\s*court)/i,
    weight: 50,
    indicator: 'Intimidation using fake law enforcement, "Digital Arrest", or customs drug parcel claims',
    rec: 'Police, CBI, and Customs never conduct video call interrogations or demand money to clear charges.',
    scamType: 'Digital Arrest & Authority Impersonation'
  },
  {
    id: 'SUSPICIOUS_LINK',
    name: 'Unverified External Hyperlink',
    pattern: /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+)/i,
    weight: 20,
    indicator: 'Embedded hyperlink directing to external destination',
    rec: 'Inspect link destinations carefully; prefer typing official domain names directly into your browser.'
  }
];

export function runRuleEngine(type: ContentType, content: string, subject?: string): AnalysisResponse {
  const fullText = `${subject ? subject + ' ' : ''}${content}`;
  const matchedRules: RuleMatch[] = [];
  let detectedScamType = 'Unclassified / Suspicious Communication';

  for (const rule of RULES) {
    if (rule.pattern.test(fullText)) {
      matchedRules.push({
        ruleId: rule.id,
        name: rule.name,
        weight: rule.weight,
        indicator: rule.indicator,
        recommendation: rule.rec,
        detectedScamType: rule.scamType
      });
      if (rule.scamType && detectedScamType === 'Unclassified / Suspicious Communication') {
        detectedScamType = rule.scamType;
      }
    }
  }

  // Extract URLs from content if any
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const urlsFound = fullText.match(urlRegex) || [];
  let urlAnalysisDetail = undefined;

  if (type === 'url') {
    urlAnalysisDetail = analyzeUrl(content.trim());
  } else if (urlsFound.length > 0 && urlsFound[0]) {
    urlAnalysisDetail = analyzeUrl(urlsFound[0]);
  }

  // Calculate raw score
  let totalWeight = 0;
  for (const match of matchedRules) {
    totalWeight += match.weight;
  }

  if (urlAnalysisDetail) {
    totalWeight += Math.round(urlAnalysisDetail.heuristic_risk_score * 0.45);
  }

  // Cap score between 0 and 100
  let finalScore = Math.min(100, Math.max(0, totalWeight));

  // If no triggers and short text, default low
  if (matchedRules.length === 0 && (!urlAnalysisDetail || urlAnalysisDetail.heuristic_risk_score < 20)) {
    finalScore = Math.min(15, fullText.length > 0 ? 8 : 0);
  }

  // Classification based on master prompt requirements:
  // 0-25: SAFE
  // 26-50: MODERATE
  // 51-80: SCAM
  // 81-100: DO NOT TOUCH
  let category: RiskCategory = 'SAFE';
  let threatLevel: ThreatLevel = 'Low';

  if (finalScore <= 25) {
    category = 'SAFE';
    threatLevel = 'Low';
    if (detectedScamType === 'Unclassified / Suspicious Communication') {
      detectedScamType = 'Low Risk Communication';
    }
  } else if (finalScore <= 50) {
    category = 'MODERATE';
    threatLevel = 'Moderate';
    if (detectedScamType === 'Unclassified / Suspicious Communication') {
      detectedScamType = 'Potential Unsolicited / Ambiguous Outreach';
    }
  } else if (finalScore <= 80) {
    category = 'SCAM';
    threatLevel = 'High';
    if (detectedScamType === 'Unclassified / Suspicious Communication') {
      detectedScamType = 'Suspected Phishing / Social Engineering';
    }
  } else {
    category = 'DO NOT TOUCH';
    threatLevel = 'Extremely High';
  }

  const indicators = matchedRules.map(m => m.indicator);
  if (urlAnalysisDetail && urlAnalysisDetail.heuristic_risk_score > 30) {
    if (urlAnalysisDetail.has_suspicious_tld) {
      indicators.push(`Domain uses high-risk suspicious TLD (.${urlAnalysisDetail.tld})`);
    }
    if (urlAnalysisDetail.has_url_shortener) {
      indicators.push('URL is concealed behind a URL shortening redirection service');
    }
    if (urlAnalysisDetail.is_ip_address) {
      indicators.push('Host domain is a raw numerical IP address instead of a verified registered domain');
    }
    if (urlAnalysisDetail.suspicious_keywords_found.length > 0) {
      indicators.push(`URL contains deceptive security/login keywords: ${urlAnalysisDetail.suspicious_keywords_found.slice(0, 3).join(', ')}`);
    }
  }

  const recommendations: string[] = [];
  for (const m of matchedRules) {
    if (m.recommendation && !recommendations.includes(m.recommendation)) {
      recommendations.push(m.recommendation);
    }
  }
  if (recommendations.length === 0) {
    recommendations.push('Verify any unsolicited requests through the sender’s official verified website or customer phone line.');
    recommendations.push('Do not share OTPs, passwords, or personal identity numbers.');
  }

  let explanation = '';
  if (category === 'SAFE') {
    explanation = 'No significant indicators of phishing, credential harvesting, or financial fraud were detected in this message. However, always exercise caution with unexpected communications.';
  } else if (category === 'MODERATE') {
    explanation = 'This communication exhibits some suspicious characteristics, such as unsolicited contact, pressure to review an external item, or informal phrasing. Caution is advised before interacting.';
  } else if (category === 'SCAM') {
    explanation = `Strong indicators of fraudulent activity were identified. The content uses patterns typical of ${detectedScamType.toLowerCase()}, attempting to elicit actions or direct you to unverified destinations.`;
  } else {
    explanation = `CRITICAL ALERT: This message exhibits high-threat indicators of severe phishing, financial coercion, or account takeover. Interacting with this message or its attachments carries extreme danger of financial loss or credential theft.`;
  }

  return {
    success: true,
    type,
    risk_score: finalScore,
    category,
    threat_level: threatLevel,
    scam_type: detectedScamType,
    indicators: indicators.length > 0 ? Array.from(new Set(indicators)) : ['No obvious scam indicators identified'],
    explanation,
    recommendations: recommendations.slice(0, 4),
    uncertainty: 'Heuristic rule-based detection provides pattern matching. Content context alone cannot substitute for official sender authentication.',
    url_details: urlAnalysisDetail,
    engine: 'heuristic-engine',
    analyzed_at: new Date().toISOString()
  };
}
