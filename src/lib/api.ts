import { ENV } from '@/config/env';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, onSnapshot, updateDoc } from 'firebase/firestore';

// ---- CASE TYPES ----
export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  confidenceBand: 'HIGH' | 'MED' | 'LOW';
  evidence: { page: number; snippet: string };
  source: 'OCR' | 'LLM' | 'OPERATOR';
}

export interface ValidationResult {
  ruleId: string;
  severity: 'INFO' | 'WARN' | 'FAIL' | 'PASS';
  message: string;
  relatedFields: string[];
  explain: string;
}

export interface AuditEvent {
  eventType: string;
  timestamp: string;
  actor: string;
  description: string;
}

export interface Case {
  caseId: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  fileType: 'pdf' | 'jpeg';
  languageHint: string;
  docTypePredicted: string;
  docTypeFinal: string;
  status: 'RECEIVED' | 'PROCESSING' | 'READY' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED_OCR' | 'FAILED_EXTRACTION';
  riskScore: number;
  riskBand: 'LOW' | 'MED' | 'HIGH';
  applicantName?: string;
  extractedFields?: ExtractedField[];
  validations?: ValidationResult[];
  flags?: string[];
  auditTrail?: AuditEvent[];
  decision?: { status: string; decidedBy: string; decidedAt: string; reasonCodes: string[] };
}

// ---- UPLOAD: POST multipart to n8n ----
export async function uploadDocument(file: File, languageHint: string, docType: string): Promise<{ caseId: string; status: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('languageHint', languageHint);
  formData.append('docType', docType);
  formData.append('uploadedAt', new Date().toISOString());

  const response = await fetch(ENV.N8N_BASE_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Server returned an empty response. The webhook may not be configured correctly.');
  }

  let data: { caseId?: string; status?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
  }

  if (!data.caseId) {
    if ((data as any).success) {
      const now = new Date();
      const pad = (n: number, len = 2) => String(n).padStart(len, '0');
      data.caseId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-0`;
      data.status = data.status || 'RECEIVED';
    } else {
      throw new Error(`Server response missing caseId. Response: ${JSON.stringify(data).substring(0, 200)}`);
    }
  }

  return data as { caseId: string; status: string };
}

// Parse JSON-string fields that Firestore stores as strings
function parseJsonFields(data: Record<string, any>): Record<string, any> {
  const jsonKeys = ['extractedFields', 'validations', 'auditTrail', 'llmResult', 'mobileNumbers'];
  for (const key of jsonKeys) {
    if (typeof data[key] === 'string') {
      try { data[key] = JSON.parse(data[key]); } catch { /* leave as-is */ }
    }
  }
  return data;
}

// ---- GET ALL CASES from Firestore ----
export async function getCases(): Promise<Case[]> {
  if (!db) return [];
  const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...parseJsonFields({ ...d.data() }), caseId: d.id } as Case));
}

// ---- GET SINGLE CASE ----
export async function getCase(caseId: string): Promise<Case | null> {
  if (!db) return null;
  const docRef = doc(db, 'cases', caseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { ...parseJsonFields({ ...docSnap.data() }), caseId: docSnap.id } as Case;
}

// ---- REAL-TIME CASE LISTENER ----
export function subscribeToCases(callback: (cases: Case[]) => void, onError?: (err: Error) => void) {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q,
    (snapshot) => {
      const cases = snapshot.docs.map(d => ({ ...parseJsonFields({ ...d.data() }), caseId: d.id } as Case));
      callback(cases);
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      if (onError) onError(error);
    }
  );
}

// ---- SAVE FIELD EDITS ----
export async function saveFieldEdits(caseId: string, editedFields: ExtractedField[], editorEmail: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'cases', caseId), { extractedFields: editedFields, updatedAt: new Date().toISOString() });
}

// ---- SUPERVISOR DECISION ----
export async function submitDecision(caseId: string, decision: 'APPROVED' | 'REJECTED', reasonCodes: string[], decidedBy: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'cases', caseId), {
    status: decision,
    decision: { status: decision, decidedBy, decidedAt: new Date().toISOString(), reasonCodes },
  });
}

// ---- POLL CASE STATUS (fallback if no realtime) ----
export function pollCaseStatus(caseId: string, onUpdate: (c: Case) => void, intervalMs = 4000) {
  return setInterval(async () => {
    const c = await getCase(caseId);
    if (c) onUpdate(c);
  }, intervalMs);
}
