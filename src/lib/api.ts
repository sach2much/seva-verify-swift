import { ENV } from '@/config/env';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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

  const response = await fetch(`${ENV.N8N_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ---- GET ALL CASES from Firestore ----
export async function getCases(): Promise<Case[]> {
  if (!db) return [];
  const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ caseId: d.id, ...d.data() } as Case));
}

// ---- GET SINGLE CASE ----
export async function getCase(caseId: string): Promise<Case | null> {
  if (!db) return null;
  const docRef = doc(db, 'cases', caseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { caseId: docSnap.id, ...docSnap.data() } as Case;
}

// ---- REAL-TIME CASE LISTENER ----
export function subscribeToCases(callback: (cases: Case[]) => void) {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const cases = snapshot.docs.map(d => ({ caseId: d.id, ...d.data() } as Case));
    callback(cases);
  });
}

// ---- SAVE FIELD EDITS ----
export async function saveFieldEdits(caseId: string, editedFields: ExtractedField[], editorEmail: string): Promise<void> {
  const response = await fetch(`${ENV.N8N_BASE_URL}/cases/${caseId}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, editedFields, editorEmail, editedAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error('Failed to save field edits');
}

// ---- SUPERVISOR DECISION ----
export async function submitDecision(caseId: string, decision: 'APPROVED' | 'REJECTED', reasonCodes: string[], decidedBy: string): Promise<void> {
  const response = await fetch(`${ENV.N8N_BASE_URL}/cases/${caseId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, decision, reasonCodes, decidedBy, decidedAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error('Failed to submit decision');
}

// ---- POLL CASE STATUS (fallback if no realtime) ----
export function pollCaseStatus(caseId: string, onUpdate: (c: Case) => void, intervalMs = 4000) {
  return setInterval(async () => {
    const c = await getCase(caseId);
    if (c) onUpdate(c);
  }, intervalMs);
}
