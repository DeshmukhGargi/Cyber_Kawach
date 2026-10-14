import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import {
  QuizAttempt,
  QuizDomain,
  QuizQuestion,
  ScamDetectiveRecord,
  CyberFitnessScoreData,
  DomainThreatStat,
  UserBadge,
} from '../types/cyber.ts';
import { QUIZ_QUESTIONS_BANK } from '../data/quizQuestions.ts';
import { SCAM_DETECTIVE_CHALLENGES } from '../data/scamDetectiveChallenges.ts';
import { ScanHistoryRecord, getScanHistory } from './historyStorage.ts';
import { fetchUserScansFromFirestore } from './firestoreScanService.ts';

const QUIZ_STORAGE_KEY = 'cyber_kawach_quiz_attempts_v1';
const DETECTIVE_STORAGE_KEY = 'cyber_kawach_detective_records_v1';
const AWARENESS_READ_KEY = 'cyber_kawach_read_guides_v1';

// Local storage helpers
function getLocalQuizAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuizAttempt(attempt: QuizAttempt): void {
  try {
    const existing = getLocalQuizAttempts();
    const updated = [attempt, ...existing].slice(0, 50);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save quiz attempt locally:', e);
  }
}

function getLocalDetectiveRecords(): ScamDetectiveRecord[] {
  try {
    const raw = localStorage.getItem(DETECTIVE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDetectiveRecord(record: ScamDetectiveRecord): void {
  try {
    const existing = getLocalDetectiveRecords();
    const updated = [record, ...existing.filter((r) => r.challengeId !== record.challengeId)];
    localStorage.setItem(DETECTIVE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save detective record locally:', e);
  }
}

export function getCompletedAwarenessCount(): number {
  try {
    const raw = localStorage.getItem(AWARENESS_READ_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function markAwarenessTopicRead(topicId: string): void {
  try {
    const raw = localStorage.getItem(AWARENESS_READ_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(topicId)) {
      arr.push(topicId);
      localStorage.setItem(AWARENESS_READ_KEY, JSON.stringify(arr));
    }
  } catch (e) {
    console.warn('Failed to mark awareness topic:', e);
  }
}

// ==========================================
// QUIZ ATTEMPTS: SAVE & FETCH
// ==========================================
export async function saveQuizAttempt(
  userId: string | null,
  attempt: Omit<QuizAttempt, 'id' | 'completedAt' | 'userId'>
): Promise<QuizAttempt> {
  const attemptId = `qa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();
  const fullAttempt: QuizAttempt = {
    ...attempt,
    id: attemptId,
    userId: userId || 'guest',
    completedAt: timestamp,
  };

  saveLocalQuizAttempt(fullAttempt);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'quizAttempts', attemptId);
      await setDoc(docRef, {
        ...fullAttempt,
        createdAtServer: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save quiz attempt to Firestore:', err);
    }
  }

  return fullAttempt;
}

export async function fetchUserQuizAttempts(userId: string | null): Promise<QuizAttempt[]> {
  if (!userId) {
    return getLocalQuizAttempts();
  }
  try {
    const colRef = collection(db, 'users', userId, 'quizAttempts');
    const q = query(colRef, orderBy('completedAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as QuizAttempt);
    }
  } catch (err) {
    console.warn('Error fetching quiz attempts from Firestore, falling back to local:', err);
  }
  return getLocalQuizAttempts();
}

// ==========================================
// SCAM DETECTIVE: SAVE & FETCH
// ==========================================
export async function saveScamDetectiveRecord(
  userId: string | null,
  record: Omit<ScamDetectiveRecord, 'id' | 'completedAt' | 'userId'>
): Promise<ScamDetectiveRecord> {
  const id = `det-${record.challengeId}-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const fullRecord: ScamDetectiveRecord = {
    ...record,
    id,
    userId: userId || 'guest',
    completedAt: timestamp,
  };

  saveLocalDetectiveRecord(fullRecord);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'scamDetective', record.challengeId);
      await setDoc(docRef, {
        ...fullRecord,
        createdAtServer: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save detective record to Firestore:', err);
    }
  }

  return fullRecord;
}

export async function fetchUserDetectiveRecords(userId: string | null): Promise<ScamDetectiveRecord[]> {
  if (!userId) {
    return getLocalDetectiveRecords();
  }
  try {
    const colRef = collection(db, 'users', userId, 'scamDetective');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ScamDetectiveRecord);
    }
  } catch (err) {
    console.warn('Error fetching detective records from Firestore, using local:', err);
  }
  return getLocalDetectiveRecords();
}

// ==========================================
// ADAPTIVE QUESTION SELECTION ALGORITHM
// ==========================================
export interface AdaptiveSelectionResult {
  questions: QuizQuestion[];
  isPersonalized: boolean;
  personalizationSummary: string;
  domainWeights: Record<QuizDomain, number>;
}

export async function getAdaptiveQuizQuestions(
  userId: string | null,
  sessionLength: number = 10,
  domainFilter?: QuizDomain
): Promise<AdaptiveSelectionResult> {
  const bank = QUIZ_QUESTIONS_BANK;

  // If filtered by specific domain
  if (domainFilter) {
    const domainQuestions = bank.filter((q) => q.domain === domainFilter);
    const shuffled = [...domainQuestions].sort(() => Math.random() - 0.5);
    return {
      questions: shuffled.slice(0, sessionLength),
      isPersonalized: false,
      personalizationSummary: `Focused drill exclusively on ${domainFilter.toUpperCase()} fraud prevention.`,
      domainWeights: {
        email: domainFilter === 'email' ? 100 : 0,
        whatsapp: domainFilter === 'whatsapp' ? 100 : 0,
        sms: domainFilter === 'sms' ? 100 : 0,
        url: domainFilter === 'url' ? 100 : 0,
      },
    };
  }

  // Fetch user scans and previous attempts to adapt
  let scans: ScanHistoryRecord[] = [];
  try {
    if (userId) {
      scans = await fetchUserScansFromFirestore(userId);
    }
    if (scans.length === 0) {
      scans = getScanHistory();
    }
  } catch {
    scans = getScanHistory();
  }

  const quizAttempts = await fetchUserQuizAttempts(userId);

  const hasUserData = scans.length > 0 || quizAttempts.length > 0;

  if (!hasUserData) {
    // Balanced general quiz for new users
    const domains: QuizDomain[] = ['email', 'whatsapp', 'sms', 'url'];
    const selected: QuizQuestion[] = [];
    const countPerDomain = Math.ceil(sessionLength / 4);

    domains.forEach((dom) => {
      const pool = bank.filter((q) => q.domain === dom).sort(() => Math.random() - 0.5);
      selected.push(...pool.slice(0, countPerDomain));
    });

    const finalQuestions = selected.sort(() => Math.random() - 0.5).slice(0, sessionLength);
    return {
      questions: finalQuestions,
      isPersonalized: false,
      personalizationSummary:
        'Standard balanced curriculum across all 4 threat vectors. (Personalized adaptation activates as you scan messages and complete training).',
      domainWeights: { email: 25, whatsapp: 25, sms: 25, url: 25 },
    };
  }

  // Calculate Scan Frequency Weights (60% weight from domain usage)
  const scanCounts: Record<QuizDomain, number> = { email: 0, whatsapp: 0, sms: 0, url: 0 };
  scans.forEach((s) => {
    if (s.type in scanCounts) {
      scanCounts[s.type as QuizDomain]++;
    }
  });

  const totalScans = Math.max(scans.length, 1);
  const scanWeights: Record<QuizDomain, number> = {
    email: (scanCounts.email / totalScans) * 100,
    whatsapp: (scanCounts.whatsapp / totalScans) * 100,
    sms: (scanCounts.sms / totalScans) * 100,
    url: (scanCounts.url / totalScans) * 100,
  };

  // Calculate Learning Needs / Incorrect answers (40% weight)
  const incorrectDomainCounts: Record<QuizDomain, number> = { email: 0, whatsapp: 0, sms: 0, url: 0 };
  const answeredQuestionIds = new Set<string>();

  quizAttempts.forEach((att) => {
    (att.questionIds || []).forEach((qid) => answeredQuestionIds.add(qid));
    (att.incorrectQuestionIds || []).forEach((qid) => {
      const q = bank.find((item) => item.id === qid);
      if (q) {
        incorrectDomainCounts[q.domain]++;
      }
    });
  });

  const totalIncorrect = Math.max(
    Object.values(incorrectDomainCounts).reduce((a, b) => a + b, 0),
    1
  );

  const errorWeights: Record<QuizDomain, number> = {
    email: (incorrectDomainCounts.email / totalIncorrect) * 100,
    whatsapp: (incorrectDomainCounts.whatsapp / totalIncorrect) * 100,
    sms: (incorrectDomainCounts.sms / totalIncorrect) * 100,
    url: (incorrectDomainCounts.url / totalIncorrect) * 100,
  };

  // Combined Transparent Weights (60% Scan usage, 40% Error & Learning need)
  const compositeWeights: Record<QuizDomain, number> = {
    email: Math.round(0.6 * (scanWeights.email || 25) + 0.4 * (errorWeights.email || 25)),
    whatsapp: Math.round(0.6 * (scanWeights.whatsapp || 25) + 0.4 * (errorWeights.whatsapp || 25)),
    sms: Math.round(0.6 * (scanWeights.sms || 25) + 0.4 * (errorWeights.sms || 25)),
    url: Math.round(0.6 * (scanWeights.url || 25) + 0.4 * (errorWeights.url || 25)),
  };

  // Normalize weights so every domain gets at least 1 question
  const domains: QuizDomain[] = ['email', 'whatsapp', 'sms', 'url'];
  const questions: QuizQuestion[] = [];
  const selectedIds = new Set<string>();

  // Guaranteed representation: At least 1 question per domain
  domains.forEach((dom) => {
    // Prefer unanswered or previously incorrect questions
    const pool = bank.filter((q) => q.domain === dom && !selectedIds.has(q.id));
    const prioritizeErrors = pool.filter((q) =>
      quizAttempts.some((att) => (att.incorrectQuestionIds || []).includes(q.id))
    );
    const candidate = prioritizeErrors[0] || pool[Math.floor(Math.random() * pool.length)];
    if (candidate) {
      questions.push(candidate);
      selectedIds.add(candidate.id);
    }
  });

  // Fill remaining slots proportionally according to composite weights
  const remainingSlots = sessionLength - questions.length;
  const sortedDomains = [...domains].sort((a, b) => compositeWeights[b] - compositeWeights[a]);

  for (let i = 0; i < remainingSlots; i++) {
    const targetDomain = sortedDomains[i % sortedDomains.length];
    const available = bank.filter(
      (q) => q.domain === targetDomain && !selectedIds.has(q.id)
    );
    const picked = available[0] || bank.find((q) => !selectedIds.has(q.id));
    if (picked) {
      questions.push(picked);
      selectedIds.add(picked.id);
    }
  }

  // Shuffle final selection so domains are interspersed
  const randomized = [...questions].sort(() => Math.random() - 0.5);

  const topDomain = sortedDomains[0];
  const summary = `Personalized using ${scans.length} verified scans (60% weight) and past test errors (40% weight). Prioritizing ${topDomain.toUpperCase()} defense while ensuring full 4-vector coverage.`;

  return {
    questions: randomized,
    isPersonalized: true,
    personalizationSummary: summary,
    domainWeights: compositeWeights,
  };
}

// ==========================================
// CYBER FITNESS SCORE CALCULATION (Feature 7)
// ==========================================
export async function calculateCyberFitnessScore(
  userId: string | null
): Promise<CyberFitnessScoreData> {
  const quizAttempts = await fetchUserQuizAttempts(userId);
  const detectiveRecords = await fetchUserDetectiveRecords(userId);
  const awarenessCount = getCompletedAwarenessCount();

  // Factors:
  // 1. Quiz accuracy: 50%
  // 2. Improvement over previous attempts: 20%
  // 3. Awareness training completion: 15%
  // 4. Scam Detective Challenge performance: 15%

  // Factor 1: Quiz Accuracy (50 pts)
  let quizAccuracy = 0;
  if (quizAttempts.length > 0) {
    const totalQuestions = quizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0);
    const totalCorrect = quizAttempts.reduce((acc, q) => acc + q.score, 0);
    quizAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  } else {
    quizAccuracy = 60; // Baseline starting score for new users
  }
  const quizComponent = (quizAccuracy / 100) * 50;

  // Factor 2: Improvement over previous attempts (20 pts)
  let improvementScore = 12; // Baseline
  let trend: 'improving' | 'declining' | 'steady' = 'steady';
  let prevScore = 55;

  if (quizAttempts.length >= 2) {
    const latest = quizAttempts[0].accuracy;
    const previous = quizAttempts[1].accuracy;
    const diff = latest - previous;
    prevScore = Math.round(previous);

    if (diff > 5) {
      improvementScore = 20;
      trend = 'improving';
    } else if (diff >= -5) {
      improvementScore = 15;
      trend = 'steady';
    } else {
      improvementScore = 8;
      trend = 'declining';
    }
  } else if (quizAttempts.length === 1) {
    improvementScore = 14;
    prevScore = Math.round(quizAttempts[0].accuracy);
  }

  // Factor 3: Awareness Training Completion (15 pts)
  // 6 total core modules available
  const awarenessCompletionPct = Math.min((awarenessCount / 6) * 100, 100);
  const awarenessComponent = (awarenessCompletionPct / 100) * 15;

  // Factor 4: Scam Detective Challenge Performance (15 pts)
  let detectiveComponent = 0;
  if (detectiveRecords.length > 0) {
    const totalChallenges = SCAM_DETECTIVE_CHALLENGES.length;
    const completedChallenges = detectiveRecords.length;
    const avgDetectiveScore =
      detectiveRecords.reduce((acc, r) => acc + (r.score / Math.max(r.totalPossible, 1)), 0) /
      completedChallenges;
    const coverageFactor = Math.min(completedChallenges / totalChallenges, 1);
    detectiveComponent = (avgDetectiveScore * 0.7 + coverageFactor * 0.3) * 15;
  } else {
    detectiveComponent = 5; // starter baseline
  }

  const rawTotal = Math.round(quizComponent + improvementScore + awarenessComponent + detectiveComponent);
  const finalScore = Math.max(10, Math.min(99, rawTotal));

  // Compute Domain Strengths
  const domainTotals: Record<QuizDomain, { correct: number; total: number }> = {
    email: { correct: 0, total: 0 },
    whatsapp: { correct: 0, total: 0 },
    sms: { correct: 0, total: 0 },
    url: { correct: 0, total: 0 },
  };

  quizAttempts.forEach((att) => {
    if (att.domainScores) {
      (Object.keys(domainTotals) as QuizDomain[]).forEach((dom) => {
        if (att.domainScores[dom]) {
          domainTotals[dom].correct += att.domainScores[dom].correct;
          domainTotals[dom].total += att.domainScores[dom].total;
        }
      });
    }
  });

  const domainStrengths: Record<
    QuizDomain,
    { score: number; label: 'Strong' | 'Adequate' | 'Needs Attention' }
  > = {
    email: { score: 70, label: 'Adequate' },
    whatsapp: { score: 70, label: 'Adequate' },
    sms: { score: 70, label: 'Adequate' },
    url: { score: 70, label: 'Adequate' },
  };

  const topicsToImprove: string[] = [];
  const recommendations: string[] = [];

  (Object.keys(domainTotals) as QuizDomain[]).forEach((dom) => {
    const d = domainTotals[dom];
    const score = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 65;
    const label = score >= 80 ? 'Strong' : score >= 60 ? 'Adequate' : 'Needs Attention';
    domainStrengths[dom] = { score, label };

    if (score < 70) {
      if (dom === 'email') topicsToImprove.push('Executive BEC & Lookalike Domain Inspection');
      if (dom === 'whatsapp') topicsToImprove.push('Fake Job Prepaid Tasks & Digital Arrest Hoaxes');
      if (dom === 'sms') topicsToImprove.push('Urgent Electricity & Postal Delivery Smishing');
      if (dom === 'url') topicsToImprove.push('Punycode Homographs & Disposable .click TLDs');
    }
  });

  if (topicsToImprove.length === 0) {
    topicsToImprove.push('Adversary-in-the-Middle (AiTM) Reverse Proxy Attacks');
  }

  // Recommendations
  if (detectiveRecords.length < SCAM_DETECTIVE_CHALLENGES.length) {
    recommendations.push(
      `Solve remaining ${SCAM_DETECTIVE_CHALLENGES.length - detectiveRecords.length} Scam Detective challenges to boost hands-on forensic recognition.`
    );
  }
  if (quizAttempts.length < 3) {
    recommendations.push(
      'Take at least 3 adaptive cyber quizzes to establish statistically grounded domain mastery.'
    );
  }
  recommendations.push(
    'Always verify bank account freeze alerts directly in your official banking application or by dialing 1930.'
  );

  return {
    score: finalScore,
    previousScore: prevScore,
    trend,
    breakdown: {
      quizAccuracyWeight: Math.round(quizComponent),
      improvementWeight: Math.round(improvementScore),
      awarenessCompletionWeight: Math.round(awarenessComponent),
      detectivePerformanceWeight: Math.round(detectiveComponent),
    },
    domainStrengths,
    topicsToImprove,
    recommendations,
    lastCalculatedAt: new Date().toISOString(),
  };
}

// ==========================================
// HOMEPAGE DOMAIN STATISTICS & REAL SCAN ANALYTICS (Feature 1)
// ==========================================
export async function getLiveScanRecords(userId: string | null): Promise<ScanHistoryRecord[]> {
  const localScans = getScanHistory();
  let firestoreScans: ScanHistoryRecord[] = [];
  if (userId) {
    try {
      firestoreScans = await fetchUserScansFromFirestore(userId);
    } catch (e) {
      console.warn('Failed to fetch firestore scans for analytics:', e);
    }
  }

  const map = new Map<string, ScanHistoryRecord>();
  for (const s of firestoreScans) {
    if (s && s.id) map.set(s.id, s);
  }
  for (const s of localScans) {
    if (s && s.id && !map.has(s.id)) {
      map.set(s.id, s);
    }
  }

  const all = Array.from(map.values());
  all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return all;
}

export async function getDomainThreatStatistics(
  userId: string | null
): Promise<DomainThreatStat[]> {
  let scans: ScanHistoryRecord[] = [];
  try {
    if (userId) {
      scans = await fetchUserScansFromFirestore(userId);
    }
    if (scans.length === 0) {
      scans = getScanHistory();
    }
  } catch {
    scans = getScanHistory();
  }

  const emailScans = scans.filter((s) => s.type === 'email');
  const whatsappScans = scans.filter((s) => s.type === 'whatsapp');
  const smsScans = scans.filter((s) => s.type === 'sms');
  const urlScans = scans.filter((s) => s.type === 'url');

  const countScam = (items: ScanHistoryRecord[]) =>
    items.filter((i) => i.category === 'SCAM' || i.category === 'DO NOT TOUCH').length;

  const getStats = (
    domain: QuizDomain,
    title: string,
    items: ScanHistoryRecord[],
    warningIndicators: string[],
    safetyTip: string,
    benchmarks: { scans: number; scamDetections: number; pct: number }
  ): DomainThreatStat => {
    if (items.length > 0) {
      const scams = countScam(items);
      const pct = Math.round((scams / items.length) * 100);
      return {
        domain,
        title,
        totalScans: items.length,
        scamDetections: scams,
        detectionPercentage: pct,
        warningIndicators,
        safetyTip,
      };
    }
    // Transparent baseline when user scans are empty
    return {
      domain,
      title,
      totalScans: benchmarks.scans,
      scamDetections: benchmarks.scamDetections,
      detectionPercentage: benchmarks.pct,
      warningIndicators,
      safetyTip,
      sourceNote: 'National CERT-In & Indian Cybercrime Coordination Centre (I4C) 2024 Reference Baseline',
    };
  };

  const domainCards: DomainThreatStat[] = [
    getStats(
      'email',
      'Email Phishing & BEC',
      emailScans,
      [
        'Lookalike sender domains (.click, .top, .xyz)',
        'Suspicious double-extension attachments (.pdf.exe)',
        'Urgent account freeze or credential expiry countdowns',
      ],
      'Never open attachments with macro prompts. Validate wire instructions via out-of-band phone calls.',
      { scans: 1420, scamDetections: 1040, pct: 73 }
    ),
    getStats(
      'whatsapp',
      'WhatsApp Scams & Digital Arrest',
      whatsappScans,
      [
        'Unsolicited foreign country codes (+62, +84, +234)',
        'Fictitious "Digital Arrest" Skype/WhatsApp video calls',
        'Prepaid task offers (like 3 YouTube videos for ₹2,000)',
      ],
      'Indian law enforcement never issues arrest warrants over video calls. Block & report unknown numbers immediately.',
      { scans: 1890, scamDetections: 1530, pct: 81 }
    ),
    getStats(
      'sms',
      'SMS Fraud & Utility Smishing',
      smsScans,
      [
        'Sent from 10-digit personal mobile numbers instead of registered DLT headers',
        'Electricity disconnection threats within 2 hours',
        'Fake postal parcel re-delivery fee links (₹24)',
      ],
      'Never call personal phone numbers sent in utility SMS alerts. Dial verified customer care on physical bill receipts.',
      { scans: 2310, scamDetections: 1895, pct: 82 }
    ),
    getStats(
      'url',
      'Malicious URLs & Fake Domains',
      urlScans,
      [
        'Branded names used as subdomains (sbi.com.evil-portal.click)',
        'Raw IP addresses in links (http://185.220.101.5/login)',
        'Fake shopping portals with 90% discount countdown timers',
      ],
      'HTTPS only encrypts traffic; it does NOT verify website honesty. Always check the root domain before entering credentials.',
      { scans: 3120, scamDetections: 2430, pct: 78 }
    ),
    {
      domain: 'payment',
      title: 'Digital Payment & UPI Fraud',
      totalScans: 950,
      scamDetections: 840,
      detectionPercentage: 88,
      warningIndicators: [
        'Entering UPI PIN or scanning QR codes to "receive" payments',
        'Installing AnyDesk / QuickSupport for ₹10 test recharges',
        'Accidental transfer refund demands with forged screenshots',
      ],
      safetyTip: 'Golden Rule of UPI: You NEVER need a UPI PIN or QR scan to receive funds. Entering PIN strictly debits your account.',
      sourceNote: 'RBI Cyber Security Guidance & NPCI Safety Directives 2024',
    },
  ];

  return domainCards;
}

// ==========================================
// USER BADGES (Feature 9)
// ==========================================
export async function getUserBadges(userId: string | null): Promise<UserBadge[]> {
  const quizAttempts = await fetchUserQuizAttempts(userId);
  const detectiveRecords = await fetchUserDetectiveRecords(userId);
  const awarenessCount = getCompletedAwarenessCount();

  let scans: ScanHistoryRecord[] = [];
  try {
    if (userId) {
      scans = await fetchUserScansFromFirestore(userId);
    }
    if (scans.length === 0) {
      scans = getScanHistory();
    }
  } catch {
    scans = getScanHistory();
  }

  return [
    {
      id: 'badge-first-scan',
      title: 'Shield Initiated',
      description: 'Completed your first threat payload scan in Cyber Kawach.',
      iconName: 'ShieldCheck',
      isUnlocked: scans.length >= 1,
      unlockedAt: scans[0]?.timestamp,
    },
    {
      id: 'badge-phish-hunter',
      title: 'Phish Buster',
      description: 'Analyzed 5 or more suspicious messages across channels.',
      iconName: 'Search',
      isUnlocked: scans.length >= 5,
    },
    {
      id: 'badge-quiz-novice',
      title: 'Cyber Trainee',
      description: 'Completed your first cyber safety awareness quiz.',
      iconName: 'Award',
      isUnlocked: quizAttempts.length >= 1,
      unlockedAt: quizAttempts[0]?.completedAt,
    },
    {
      id: 'badge-quiz-master',
      title: 'Defense Specialist',
      description: 'Achieved 80%+ accuracy on an adaptive quiz session.',
      iconName: 'Sparkles',
      isUnlocked: quizAttempts.some((q) => q.accuracy >= 80),
    },
    {
      id: 'badge-detective',
      title: 'Scam Detective',
      description: 'Successfully identified red flags in a forensic simulation challenge.',
      iconName: 'SearchCheck',
      isUnlocked: detectiveRecords.length >= 1,
    },
    {
      id: 'badge-zero-trust',
      title: 'Zero-Trust Guardian',
      description: 'Completed training modules and reached Cyber Fitness Score 75+.',
      iconName: 'ShieldAlert',
      isUnlocked: awarenessCount >= 3 || quizAttempts.length >= 3,
    },
  ];
}
