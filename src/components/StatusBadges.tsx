import { Badge } from '@/components/ui/badge';
import type { CaseStatus, RiskBand, Severity, Confidence } from '@/data/mockData';

const statusConfig: Record<CaseStatus, { className: string; label: string }> = {
  RECEIVED: { className: 'bg-muted text-muted-foreground', label: 'Received' },
  PROCESSING: { className: 'bg-info/20 text-info', label: 'Processing' },
  READY: { className: 'bg-teal/20 text-teal', label: 'Ready' },
  NEEDS_REVIEW: { className: 'bg-warning/20 text-warning', label: 'Needs Review' },
  APPROVED: { className: 'bg-success/20 text-success', label: 'Approved' },
  REJECTED: { className: 'bg-destructive/20 text-destructive', label: 'Rejected' },
  FAILED: { className: 'bg-destructive/20 text-destructive', label: 'Failed' },
};

const riskConfig: Record<RiskBand, string> = {
  LOW: 'bg-success/20 text-success',
  MED: 'bg-warning/20 text-warning',
  HIGH: 'bg-destructive/20 text-destructive',
};

const severityConfig: Record<Severity, string> = {
  PASS: 'bg-success/20 text-success',
  WARN: 'bg-warning/20 text-warning',
  FAIL: 'bg-destructive/20 text-destructive',
};

const confidenceConfig: Record<Confidence, string> = {
  HIGH: 'bg-success/20 text-success',
  MED: 'bg-warning/20 text-warning',
  LOW: 'bg-destructive/20 text-destructive',
};

export const StatusBadge = ({ status }: { status: CaseStatus }) => {
  const cfg = statusConfig[status] ?? { className: 'bg-muted text-muted-foreground', label: status };
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>;
};

export const RiskBadge = ({ band }: { band: RiskBand }) => (
  <Badge className={`${riskConfig[band] ?? 'bg-muted text-muted-foreground'} border-0 font-medium`}>{band ?? 'N/A'}</Badge>
);

export const SeverityBadge = ({ severity }: { severity: Severity }) => (
  <Badge className={`${severityConfig[severity]} border-0 font-medium`}>{severity}</Badge>
);

export const ConfidenceBadge = ({ confidence }: { confidence: Confidence }) => (
  <Badge className={`${confidenceConfig[confidence]} border-0 font-medium`}>{confidence}</Badge>
);
