import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { AnalysisResponse, ContentType, RiskCategory } from '../types/cyber.ts';
import { ScanHistoryRecord } from './historyStorage.ts';

export interface FirestoreScanRecord {
  id: string;
  userId: string;
  type: ContentType;
  riskScore: number;
  category: RiskCategory;
  timestamp: string;
  scamType: string;
  summary: string;
  indicators: string[];
  fullResult?: AnalysisResponse;
}

export interface UserScanMetrics {
  total: number;
  safe: number;
  moderate: number;
  scam: number;
  doNotTouch: number;
}

/**
 * Creates a privacy-conscious preview summary:
 * Does not store long personal messages or credentials, preserving user privacy.
 */
function createSafeSummary(type: ContentType, rawContent: string, subject?: string): string {
  if (type === 'url') {
    return rawContent.trim();
  }
  const prefix = subject ? `[${subject.trim()}] ` : '';
  const sanitized = rawContent
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email-redacted]')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card-redacted]')
    .replace(/\b\d{6,12}\b/g, '[numeric-code-redacted]')
    .trim();

  const preview = sanitized.length > 120 ? sanitized.substring(0, 120) + '...' : sanitized;
  return `${prefix}${preview}`;
}

export async function saveScanToFirestore(
  userId: string,
  result: AnalysisResponse,
  rawContent: string,
  subject?: string,
  sender?: string
): Promise<ScanHistoryRecord> {
  const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();
  const summary = createSafeSummary(result.type, rawContent, subject);

  const firestoreData = {
    userId,
    type: result.type,
    riskScore: result.risk_score,
    category: result.category,
    timestamp,
    scamType: result.scam_type,
    summary,
    indicators: result.indicators || [],
    createdAt: serverTimestamp(),
  };

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'scans', scanId);
      await setDoc(docRef, firestoreData);
    } catch (e) {
      console.warn('Firestore scan save failed, proceeding with local record:', e);
    }
  }

  return {
    id: scanId,
    timestamp,
    type: result.type,
    preview: summary,
    subject,
    sender,
    risk_score: result.risk_score,
    category: result.category,
    scam_type: result.scam_type,
    full_result: result,
  };
}

export async function fetchUserScansFromFirestore(userId: string): Promise<ScanHistoryRecord[]> {
  if (!db) return [];
  try {
    const scansCol = collection(db, 'users', userId, 'scans');
    const q = query(scansCol, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        timestamp: data.timestamp || new Date().toISOString(),
        type: data.type as ContentType,
        preview: data.summary || '',
        risk_score: data.riskScore ?? 0,
        category: data.category as RiskCategory,
        scam_type: data.scamType || 'Analysis Log',
        full_result: data.fullResult || {
          success: true,
          type: data.type,
          risk_score: data.riskScore ?? 0,
          category: data.category,
          threat_level: data.riskScore > 80 ? 'Extremely High' : data.riskScore > 50 ? 'High' : data.riskScore > 25 ? 'Moderate' : 'Low',
          scam_type: data.scamType || 'Analyzed Item',
          indicators: data.indicators || [],
          explanation: `Historical scan performed on ${new Date(data.timestamp).toLocaleString()}`,
          recommendations: ['Stay vigilant against unverified communications.'],
          uncertainty: 'Logged record from previous scan.',
          analyzed_at: data.timestamp,
        },
      };
    });
  } catch (err) {
    console.warn('Error fetching scans from Firestore:', err);
    return [];
  }
}

export async function deleteUserScanFromFirestore(userId: string, scanId: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId, 'scans', scanId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete scan from Firestore:', err);
  }
}

export function computeScanMetrics(records: ScanHistoryRecord[]): UserScanMetrics {
  let safe = 0;
  let moderate = 0;
  let scam = 0;
  let doNotTouch = 0;

  for (const r of records) {
    if (r.category === 'SAFE') safe++;
    else if (r.category === 'MODERATE') moderate++;
    else if (r.category === 'SCAM') scam++;
    else if (r.category === 'DO NOT TOUCH') doNotTouch++;
  }

  return {
    total: records.length,
    safe,
    moderate,
    scam,
    doNotTouch,
  };
}
