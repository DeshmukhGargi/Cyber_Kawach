import { AnalysisResponse, ContentType, RiskCategory } from '../types/cyber.ts';

export interface ScanHistoryRecord {
  id: string;
  timestamp: string;
  type: ContentType;
  preview: string;
  subject?: string;
  sender?: string;
  risk_score: number;
  category: RiskCategory;
  scam_type: string;
  full_result: AnalysisResponse;
}

const STORAGE_KEY = 'cyber_kawach_scans_v1';

export function saveScanToHistory(
  result: AnalysisResponse,
  rawContent: string,
  subject?: string,
  sender?: string
): ScanHistoryRecord {
  try {
    const existing = getScanHistory();
    const newRecord: ScanHistoryRecord = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: result.type,
      preview: rawContent.length > 140 ? rawContent.substring(0, 140) + '...' : rawContent,
      subject,
      sender,
      risk_score: result.risk_score,
      category: result.category,
      scam_type: result.scam_type,
      full_result: result,
    };

    // Keep up to 50 most recent records
    const updated = [newRecord, ...existing.filter((item) => item.id !== newRecord.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scan_history_updated'));
    }
    return newRecord;
  } catch (err) {
    console.warn('Failed to save scan to localStorage:', err);
    return {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: result.type,
      preview: rawContent.substring(0, 140),
      risk_score: result.risk_score,
      category: result.category,
      scam_type: result.scam_type,
      full_result: result,
    };
  }
}

export function getScanHistory(): ScanHistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function deleteScanRecord(id: string): void {
  try {
    const existing = getScanHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scan_history_updated'));
    }
  } catch (err) {
    console.warn('Failed to delete scan record:', err);
  }
}

export function clearAllScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scan_history_updated'));
    }
  } catch (err) {
    console.warn('Failed to clear scan history:', err);
  }
}
