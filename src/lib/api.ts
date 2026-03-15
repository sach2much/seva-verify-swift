import { ENV } from '@/config/env';
import { db, storage } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

// ---- CASE TYPES ----

export interface ExtractedField {
  label: string;
  value: string | null;
  confidence: number;
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
}

export interface ValidationResult {
  field: string;
  rule: string;
  result: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

export interface LlmResult {
  authenticityScore: number;
  riskBand: string;
  flags: string[];
  reasoning: string;
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
  fileName: string;
  fileType: string;
  fileStoragePath: string;
  languageHint: string;
  docType: string;
  docTypePredicted: string;
  docTypeFinal: string;
  status: string;
  riskScore: number;
  riskBand: string;
  applicantName?: string;
  ocrRawText?: string;
  extractedFields: ExtractedField[];
  validations: ValidationResult[];
  llmResult: LlmResult | null;
  flags?: string[];
  auditTrail?: AuditEvent[];
  decision?: { status: string; decidedBy: string; decidedAt: string; reasonCodes: string[] };
  fileDownloadUrl?: string;
}

// ---- HELPERS: safely parse values that might be JSON strings or already native objects ----

function safeParseArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim().startsWith('[')) {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function safeParseObject(val: unknown): Record<string, unknown> | null {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val as Record<string, unknown>;
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try { return JSON.parse(val); } catch { return null; }
  }
  return null;
}

// ---- MAP Firestore doc → App Case model ----
// n8n writes: extractedFields[].{label, value, confidence, confidenceBand, evidence}
// n8n writes: validations[].{field, rule, result, message}
// n8n writes: llmResult.{authenticityScore, riskBand, flags, reasoning}

function mapFirestoreDoc(data: Record<string, any>, docId: string): Case {
  const rawExtractedFields = safeParseArray(data.extractedFields);
  const rawValidations = safeParseArray(data.validations);
  // n8n writes llmVerification (new) — fall back to llmResult (legacy)
  const rawLlmVerification = safeParseObject(data.llmVerification);
  const rawLlmResultLegacy = safeParseObject(data.llmResult);
  const rawLlmData = rawLlmVerification || (rawLlmResultLegacy && Object.keys(rawLlmResultLegacy).length > 0 ? rawLlmResultLegacy : null);

  return {
    caseId: data.caseId || docId,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    createdByUserId: data.createdByUserId || '',
    fileName: data.fileName || '',
    fileType: data.fileType || '',
    fileStoragePath: data.fileStoragePath || '',
    languageHint: data.languageHint || '',
    docType: data.docType || 'UNKNOWN',
    docTypePredicted: data.docTypePredicted || data.docType || '',
    docTypeFinal: data.docTypeFinal || data.docType || '',
    status: data.status || 'PROCESSING',
    riskScore: data.finalRiskScore ?? data.riskScore ?? (rawLlmData ? (100 - ((rawLlmData as any).authenticityScore ?? 0)) : 0),
    riskBand: data.riskBand || (rawLlmData ? (rawLlmData as any).riskBand : 'LOW') || 'LOW',
    applicantName: data.applicantName || '',
    ocrRawText: data.ocrRawText || '',

    extractedFields: rawExtractedFields.map((f: any) => ({
      label: f.label || f.name || f.fieldName || f.key || 'unknown',
      value: f.value ?? null,
      confidence: typeof f.confidence === 'number' ? f.confidence : (typeof f.confidenceLevel === 'number' ? f.confidenceLevel : 0),
      confidenceBand: f.confidenceBand || (typeof f.confidence === 'number' ? (f.confidence >= 0.8 ? 'HIGH' : f.confidence >= 0.5 ? 'MEDIUM' : 'LOW') : 'LOW'),
      evidence: typeof f.evidence === 'string' ? f.evidence : (f.evidence?.snippet || ''),
    })),

    validations: rawValidations.map((v: any) => ({
      field: v.field || v.fieldName || v.relatedFields?.[0] || 'unknown',
      rule: v.rule || v.ruleId || v.ruleName || '',
      result: v.result || v.severity || v.status || 'UNKNOWN',
      message: v.message || v.explain || v.description || '',
    })),

    llmResult: rawLlmData ? {
      authenticityScore: (rawLlmData as any).authenticityScore ?? data.finalAuthenticityScore ?? 0,
      riskBand: (rawLlmData as any).manipulationRisk || (rawLlmData as any).riskBand || data.riskBand || 'LOW',
      flags: safeParseArray((rawLlmData as any).redFlags || (rawLlmData as any).flags) as string[],
      reasoning: (rawLlmData as any).reasoning || data.llmReasoning || '',
    } : (data.llmReasoning ? {
      authenticityScore: data.finalAuthenticityScore ?? 0,
      riskBand: data.riskBand || 'LOW',
      flags: safeParseArray(data.allFlags) as string[],
      reasoning: data.llmReasoning || '',
    } : null),

    flags: safeParseArray(data.allFlags || data.flags) as string[],
    auditTrail: safeParseArray(data.auditTrail) as AuditEvent[],
  };
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

// ---- GET ALL CASES from Firestore ----
export async function getCases(): Promise<Case[]> {
  if (!db) return [];
  const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => mapFirestoreDoc({ ...d.data() }, d.id));
}

// ---- GET SINGLE CASE ----
export async function getCase(caseId: string): Promise<Case | null> {
  if (!db) return null;
  const docRef = doc(db, 'cases', caseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapFirestoreDoc({ ...docSnap.data() }, docSnap.id);
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
      const cases = snapshot.docs.map(d => mapFirestoreDoc({ ...d.data() }, d.id));
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

// ---- GET FILE DOWNLOAD URL from Firebase Storage ----
export async function getFileDownloadUrl(storagePath: string): Promise<string | null> {
  if (!storage || !storagePath) return null;
  try {
    const fileRef = ref(storage, storagePath);
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.error('[DocVerify] Failed to get download URL:', err);
    return null;
  }
}

// ---- POLL CASE STATUS (fallback if no realtime) ----
export function pollCaseStatus(caseId: string, onUpdate: (c: Case) => void, intervalMs = 4000) {
  return setInterval(async () => {
    const c = await getCase(caseId);
    if (c) onUpdate(c);
  }, intervalMs);
}
