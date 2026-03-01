export type CaseStatus = 'RECEIVED' | 'PROCESSING' | 'READY' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED';
export type RiskBand = 'LOW' | 'MED' | 'HIGH';
export type DocType = 'Aadhaar Card' | 'PAN Card' | 'Driving License' | 'Ration Card' | 'Birth Certificate';
export type Severity = 'PASS' | 'WARN' | 'FAIL';
export type Confidence = 'HIGH' | 'MED' | 'LOW';

export interface Case {
  id: string;
  applicantName: string;
  documentType: DocType;
  status: CaseStatus;
  riskBand: RiskBand;
  riskScore: number;
  createdAt: string;
}

export const mockCases: Case[] = [
  { id: 'DVR-2026-00142', applicantName: 'Rajesh Kumar Sharma', documentType: 'Aadhaar Card', status: 'APPROVED', riskBand: 'LOW', riskScore: 12, createdAt: '2026-02-28 14:32' },
  { id: 'DVR-2026-00143', applicantName: 'Priya Deshpande', documentType: 'PAN Card', status: 'NEEDS_REVIEW', riskBand: 'MED', riskScore: 54, createdAt: '2026-02-28 15:10' },
  { id: 'DVR-2026-00144', applicantName: 'Amit Balasaheb Patil', documentType: 'Driving License', status: 'PROCESSING', riskBand: 'LOW', riskScore: 18, createdAt: '2026-03-01 09:05' },
  { id: 'DVR-2026-00145', applicantName: 'Sunita Wagh', documentType: 'Ration Card', status: 'REJECTED', riskBand: 'HIGH', riskScore: 87, createdAt: '2026-03-01 10:22' },
  { id: 'DVR-2026-00146', applicantName: 'Mohammed Irfan Khan', documentType: 'Birth Certificate', status: 'READY', riskBand: 'LOW', riskScore: 22, createdAt: '2026-03-01 11:45' },
];

export const sampleFields = [
  { name: 'Applicant Name', value: 'Rajesh Kumar Sharma', confidence: 'HIGH' as Confidence, evidence: 'Line 3: "Name: Rajesh Kumar Sharma"' },
  { name: 'Date of Birth', value: '15/08/1985', confidence: 'HIGH' as Confidence, evidence: 'Line 5: "DOB: 15/08/1985"' },
  { name: 'ID Number', value: '9234 5678 1234', confidence: 'HIGH' as Confidence, evidence: 'Line 1: "9234 5678 1234"' },
  { name: 'Address', value: '42, MG Road, Pune 411001', confidence: 'MED' as Confidence, evidence: 'Lines 7-8: partial OCR match' },
  { name: 'Issue Date', value: '01/03/2020', confidence: 'MED' as Confidence, evidence: 'Line 10: "Issued: 01/03/2020"' },
  { name: 'Issuing Authority', value: 'UIDAI, Government of India', confidence: 'LOW' as Confidence, evidence: 'Footer region — low contrast' },
];

export const validationResults = [
  { ruleId: 'REQ_FIELD_PRESENT', severity: 'PASS' as Severity, message: 'All required fields extracted', explain: 'All 6 mandatory fields for Aadhaar Card were found in the OCR output with non-empty values.' },
  { ruleId: 'ID_FORMAT_VALID', severity: 'PASS' as Severity, message: 'ID number matches Aadhaar format (XXXX XXXX XXXX)', explain: 'The extracted ID "9234 5678 1234" matches the 4-4-4 digit Aadhaar format regex.' },
  { ruleId: 'DATE_LOGICAL', severity: 'PASS' as Severity, message: 'Date of Birth is logically valid', explain: 'DOB 15/08/1985 is a valid date and applicant age (40) is within expected range.' },
  { ruleId: 'ADDR_PINCODE', severity: 'WARN' as Severity, message: 'Pincode could not be cross-verified', explain: 'Pincode 411001 was extracted but the postal database lookup returned ambiguous results for this region.' },
  { ruleId: 'CONF_THRESHOLD', severity: 'WARN' as Severity, message: 'Issuing Authority confidence below threshold', explain: 'The field "Issuing Authority" was extracted with 58% confidence, below the 70% threshold. Manual review recommended.' },
  { ruleId: 'TAMPER_HEURISTIC', severity: 'FAIL' as Severity, message: 'Possible font inconsistency detected in address block', explain: 'Heuristic analysis found a font-size deviation of 2.3pt in the address region compared to baseline template. This may indicate post-scan editing.' },
];

export const authenticityChecks = [
  { label: 'Stamp Present', status: 'Detected' },
  { label: 'Signature Present', status: 'Detected' },
  { label: 'Duplicate Check', status: 'No Duplicate Found' },
  { label: 'Template Match', status: 'Uncertain' },
];

export const auditTimeline = [
  { event: 'UPLOAD', timestamp: '2026-02-28 14:32:05', actor: 'operator@sevakendra.gov.in', description: 'Document uploaded — aadhaar_scan.pdf (2.3 MB)' },
  { event: 'OCR_COMPLETE', timestamp: '2026-02-28 14:32:22', actor: 'System', description: 'OCR completed — Google Vision API (en, mr-IN)' },
  { event: 'CLASSIFICATION', timestamp: '2026-02-28 14:32:28', actor: 'System', description: 'Classified as Aadhaar Card (confidence: 97.2%)' },
  { event: 'EXTRACTION', timestamp: '2026-02-28 14:32:35', actor: 'System', description: 'Extracted 6 fields with avg confidence 81.3%' },
  { event: 'VALIDATION', timestamp: '2026-02-28 14:32:41', actor: 'System', description: 'Validation complete — 3 PASS, 2 WARN, 1 FAIL' },
  { event: 'REVIEW', timestamp: '2026-02-28 15:10:00', actor: 'supervisor@sevakendra.gov.in', description: 'Marked for manual review — tamper flag' },
  { event: 'EDIT', timestamp: '2026-02-28 15:15:00', actor: 'supervisor@sevakendra.gov.in', description: 'Address field corrected manually' },
  { event: 'DECISION', timestamp: '2026-02-28 15:20:00', actor: 'supervisor@sevakendra.gov.in', description: 'Case APPROVED — tamper flag overridden with justification' },
];
