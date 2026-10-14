import { AnalysisRequest, AnalysisResponse, ContentType, ThreatIntelligenceResponse } from '../types/cyber.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchThreatIntelligenceFeed(): Promise<ThreatIntelligenceResponse> {
  const response = await fetch(`${API_BASE_URL}/api/threat-intelligence`);
  if (!response.ok) {
    throw new Error(`Failed to load threat intelligence feed (Status: ${response.status})`);
  }
  return await response.json();
}

export async function analyzeContent(
  type: ContentType,
  content: string,
  subject?: string,
  sender?: string
): Promise<AnalysisResponse> {
  const payload: AnalysisRequest = {
    type,
    content: content.trim(),
    subject: subject ? subject.trim() : undefined,
    sender: sender ? sender.trim() : undefined,
  };

  const makeRequest = async (): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  let response: Response;
  try {
    response = await makeRequest();
  } catch (netErr: any) {
    throw new Error(
      `Network connection to detection engine failed: ${netErr.message || 'Please check your connection.'}`
    );
  }

  let contentType = response.headers.get('content-type') || '';

  // Transparent cold-start / dev-server warmup retry:
  // If the first request returns non-JSON (e.g. gateway warmup / proxy spin-up), retry once immediately
  if (!contentType.includes('application/json')) {
    console.warn(`Initial response contentType was "${contentType}". Performing one-time transparent retry...`);
    try {
      response = await makeRequest();
      contentType = response.headers.get('content-type') || '';
    } catch {
      // Keep earlier response to be processed by error handlers below
    }
  }

  // Handle non-OK HTTP responses
  if (!response.ok) {
    let errorMsg = `Server error ${response.status}`;
    if (contentType.includes('application/json')) {
      try {
        const errJson = await response.json();
        if (errJson.error) {
          errorMsg = errJson.error;
        }
      } catch {
        errorMsg = `Server error ${response.status}: Unable to read error details.`;
      }
    } else {
      const errorText = await response.text();
      const snippet = errorText.replace(/<[^>]+>/g, '').trim().substring(0, 160);
      errorMsg = `Detection server returned error ${response.status}: ${snippet || 'Service temporarily unavailable'}`;
    }
    throw new Error(errorMsg);
  }

  // Ensure content-type is strictly application/json before parsing
  if (!contentType.includes('application/json')) {
    const rawText = await response.text();
    console.error('Non-JSON response received from /api/analyze:', rawText.substring(0, 200));
    throw new Error(
      'The detection server returned an unexpected response format. Please check the API configuration.'
    );
  }

  const result: AnalysisResponse = await response.json();
  return result;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
