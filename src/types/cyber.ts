/**
 * Cyber Kawach - Type Definitions
 */

export type ContentType = 'email' | 'whatsapp' | 'sms' | 'url';

export type RiskCategory = 'SAFE' | 'MODERATE' | 'SCAM' | 'DO NOT TOUCH';

export type ThreatLevel = 'Low' | 'Moderate' | 'High' | 'Extremely High';

export interface UrlAnalysisDetail {
  protocol: 'http' | 'https' | 'unknown';
  is_ip_address: boolean;
  has_suspicious_tld: boolean;
  tld: string;
  domain: string;
  has_url_shortener: boolean;
  subdomain_count: number;
  suspicious_keywords_found: string[];
  has_unusual_characters: boolean;
  has_port: boolean;
  heuristic_risk_score: number;
}

export interface AnalysisRequest {
  type: ContentType;
  content: string;
  subject?: string;
  sender?: string;
}

export interface AnalysisResponse {
  success: boolean;
  type: ContentType;
  risk_score: number;
  category: RiskCategory;
  threat_level: ThreatLevel;
  scam_type: string;
  indicators: string[];
  explanation: string;
  recommendations: string[];
  uncertainty: string;
  url_details?: UrlAnalysisDetail;
  engine?: 'gemini-ai' | 'heuristic-engine';
  analyzed_at?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  type: ContentType;
  sender_preview: string;
  content: string;
  subject?: string;
  context: string;
  options: {
    id: string;
    text: string;
    is_safe: boolean;
    feedback: string;
  }[];
  red_flags: string[];
  redFlags?: string[];
  psychological_triggers: string[];
  recommended_action: string;
}

export interface AwarenessGuide {
  id: string;
  title: string;
  category: string;
  iconName: string;
  summary: string;
  tactics: string[];
  redFlags: string[];
  preventionSteps: string[];
  realWorldExample: string;
}

export type ThreatSeverity = 'Critical' | 'High' | 'Medium' | 'Informational';

export interface ThreatFeedItem {
  id: string;
  title: string;
  summary: string;
  source: 'The Hacker News' | 'CISA Advisory' | 'CERT Intelligence';
  source_url: string;
  category: 'advisory' | 'news' | 'phishing' | 'vulnerability';
  published_at: string;
  severity: ThreatSeverity;
  cve_id?: string;
  tags: string[];
}

export interface ThreatIntelligenceResponse {
  success: boolean;
  total: number;
  last_updated: string;
  source_status: {
    cisa: boolean;
    thn: boolean;
  };
  items: ThreatFeedItem[];
}

export type QuizDomain = 'email' | 'whatsapp' | 'sms' | 'url';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  domain: QuizDomain;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  difficulty: QuestionDifficulty;
  learningObjective: string;
  warningIndicator: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  domainScores: Record<QuizDomain, { correct: number; total: number; accuracy: number }>;
  completedAt: string;
  mode: 'standard' | 'extended' | 'domain-focused';
  questionIds: string[];
  incorrectQuestionIds: string[];
}

export interface RedFlagIndicator {
  id: string;
  text: string;
  explanation: string;
  severity: 'high' | 'critical' | 'medium';
  isRedFlag: boolean;
  category: string;
}

export interface ScamDetectiveChallenge {
  id: string;
  title: string;
  domain: QuizDomain;
  scenarioType: string;
  senderDisplay: string;
  timestampDisplay: string;
  subject?: string;
  bodyContent: string;
  context: string;
  indicators: RedFlagIndicator[];
  officialVerificationMethod: string;
  safeNextSteps: string[];
}

export interface ScamDetectiveRecord {
  id: string;
  challengeId: string;
  userId: string;
  identifiedIndicatorIds: string[];
  score: number;
  totalPossible: number;
  completedAt: string;
}

export interface CyberFitnessScoreData {
  score: number; // 0-100
  previousScore?: number;
  trend: 'improving' | 'declining' | 'steady';
  breakdown: {
    quizAccuracyWeight: number; // 50%
    improvementWeight: number; // 20%
    awarenessCompletionWeight: number; // 15%
    detectivePerformanceWeight: number; // 15%
  };
  domainStrengths: Record<QuizDomain, { score: number; label: 'Strong' | 'Adequate' | 'Needs Attention' }>;
  topicsToImprove: string[];
  recommendations: string[];
  lastCalculatedAt: string;
}

export interface DomainThreatStat {
  domain: QuizDomain | 'payment';
  title: string;
  totalScans: number;
  scamDetections: number;
  detectionPercentage: number;
  warningIndicators: string[];
  safetyTip: string;
  sourceNote?: string;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

