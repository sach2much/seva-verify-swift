import { Badge } from '@/components/ui/badge';

// Flexible types that accept both mock data values and n8n/Firestore values
type CaseStatusLike = string;
type RiskBandLike = string;
type SeverityLike = string;
type ConfidenceLike = string;

const statusConfig: Record<string, { className: string; label: string }> = {
  RECEIVED: { className: 'bg-muted text-muted-foreground', label: 'Received' },
  PROCESSING: { className: 'bg-info/20 text-info', label: 'Processing' },
  READY: { className: 'bg-teal/20 text-teal', label: 'Ready' },
  NEEDS_REVIEW: { className: 'bg-warning/20 text-warning', label: 'Needs Review' },
  APPROVED: { className: 'bg-success/20 text-success', label: 'Approved' },
  REJECTED: { className: 'bg-destructive/20 text-destructive', label: 'Rejected' },
  FAILED: { className: 'bg-destructive/20 text-destructive', label: 'Failed' },
  VERIFIED: { className: 'bg-success/20 text-success', label: 'Verified' },
  ERROR: { className: 'bg-destructive/20 text-destructive', label: 'Error' },
  FAILED_OCR: { className: 'bg-destructive/20 text-destructive', label: 'OCR Failed' },
  FAILED_EXTRACTION: { className: 'bg-destructive/20 text-destructive', label: 'Extraction Failed' },
};

const riskConfig: Record<string, string> = {
  LOW: 'bg-success/20 text-success',
  MED: 'bg-warning/20 text-warning',
  MEDIUM: 'bg-warning/20 text-warning',
  HIGH: 'bg-destructive/20 text-destructive',
};

const severityConfig: Record<string, string> = {
  PASS: 'bg-success/20 text-success',
  WARN: 'bg-warning/20 text-warning',
  FAIL: 'bg-destructive/20 text-destructive',
  INFO: 'bg-info/20 text-info',
};

const confidenceConfig: Record<string, string> = {
  HIGH: 'bg-success/20 text-success',
  MED: 'bg-warning/20 text-warning',
  MEDIUM: 'bg-warning/20 text-warning',
  LOW: 'bg-destructive/20 text-destructive',
};

export const StatusBadge = ({ status }: { status: CaseStatusLike }) => {
  const cfg = statusConfig[status] ?? { className: 'bg-muted text-muted-foreground', label: status };
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>;
};

export const RiskBadge = ({ band }: { band: RiskBandLike }) => (
  <Badge className={`${riskConfig[band] ?? 'bg-muted text-muted-foreground'} border-0 font-medium`}>{band ?? 'N/A'}</Badge>
);

export const SeverityBadge = ({ severity }: { severity: SeverityLike }) => (
  <Badge className={`${severityConfig[severity] ?? 'bg-muted text-muted-foreground'} border-0 font-medium`}>{severity}</Badge>
);

export const ConfidenceBadge = ({ confidence }: { confidence: ConfidenceLike }) => (
  <Badge className={`${confidenceConfig[confidence] ?? 'bg-muted text-muted-foreground'} border-0 font-medium`}>{confidence}</Badge>
);
