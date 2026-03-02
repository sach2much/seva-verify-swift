import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { StatusBadge, RiskBadge, SeverityBadge, ConfidenceBadge } from '@/components/StatusBadges';
import { sampleFields, validationResults, authenticityChecks, auditTimeline, mockCases, type CaseStatus } from '@/data/mockData';
import { getCase, saveFieldEdits, submitDecision, type Case as ApiCase } from '@/lib/api';
import { ENV } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronRight, Download, CheckCircle, AlertTriangle, XCircle,
  Upload as UploadIcon, ScanSearch, Layers, FileOutput, ShieldCheck, Pencil, Clock, ChevronDown, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const eventIcons: Record<string, typeof CheckCircle> = {
  UPLOAD: UploadIcon, OCR_COMPLETE: ScanSearch, CLASSIFICATION: Layers,
  EXTRACTION: FileOutput, VALIDATION: ShieldCheck, REVIEW: AlertTriangle,
  EDIT: Pencil, DECISION: CheckCircle,
};

// Loading skeleton for the whole page
const CaseDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <AppNavbar />
    <main className="container mx-auto px-4 py-6">
      <Skeleton className="mb-4 h-4 w-64" />
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </main>
  </div>
);

const CaseNotFound = () => (
  <div className="min-h-screen bg-background">
    <AppNavbar />
    <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
      <ScanSearch className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-xl font-bold text-foreground">Case Not Found</h1>
      <p className="mb-6 text-muted-foreground">The case you're looking for doesn't exist.</p>
      <Link to="/dashboard"><Button><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button></Link>
    </main>
  </div>
);

const CaseDetail = () => {
  const { caseId } = useParams();
  const { user } = useAuth();
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiCase, setApiCase] = useState<ApiCase | null>(null);
  const [savingFields, setSavingFields] = useState(false);
  const [decidingApprove, setDecidingApprove] = useState(false);
  const [decidingReject, setDecidingReject] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Use mock data as fallback
  const mockCase = mockCases.find(c => c.id === caseId) || mockCases[0];
  const isFirebaseConfigured = !!ENV.FIREBASE_API_KEY;

  useEffect(() => {
    if (!caseId) return;

    if (!isFirebaseConfigured) {
      // Demo mode: use mock data
      setLoading(false);
      if (!mockCases.find(c => c.id === caseId)) {
        // Still show mock[0] for demo
      }
      return;
    }

    getCase(caseId).then(c => {
      if (c) {
        setApiCase(c);
      }
      // If null, fall through to mock data
    }).catch(() => {
      // Firestore error — fall back to mock
    }).finally(() => setLoading(false));
  }, [caseId, isFirebaseConfigured]);

  if (loading) return <CaseDetailSkeleton />;
  if (notFound && isFirebaseConfigured) return <CaseNotFound />;

  // Resolve data sources
  const caseData = apiCase ? {
    id: apiCase.caseId,
    applicantName: apiCase.applicantName || 'Unknown',
    documentType: apiCase.docTypeFinal || apiCase.docTypePredicted || 'Unknown',
    status: localStatus || apiCase.status,
    riskBand: apiCase.riskBand,
    riskScore: apiCase.riskScore,
    createdAt: apiCase.createdAt,
  } : { ...mockCase, status: localStatus || mockCase.status };

  const fields = apiCase?.extractedFields?.map(f => ({
    name: f.label,
    value: f.value,
    confidence: f.confidenceBand,
    evidence: f.evidence?.snippet || '',
  })) ?? sampleFields;

  const validations = apiCase?.validations?.map(v => ({
    ruleId: v.ruleId,
    severity: v.severity as 'PASS' | 'WARN' | 'FAIL',
    message: v.message,
    explain: v.explain,
  })) ?? validationResults;

  const timeline = apiCase?.auditTrail?.map(e => ({
    event: e.eventType,
    timestamp: e.timestamp,
    actor: e.actor,
    description: e.description,
  })) ?? auditTimeline;

  const userEmail = user?.email || 'demo@sevakendra.gov.in';
  const isUsingMockData = !apiCase;

  const handleSaveEdits = async () => {
    if (isUsingMockData) {
      toast.info('Field edits saved locally (demo mode)');
      return;
    }
    setSavingFields(true);
    try {
      const editedFields = apiCase.extractedFields!.map(f => ({
        ...f,
        value: fieldRefs.current[f.key]?.value ?? f.value,
      }));
      await saveFieldEdits(caseData.id, editedFields, userEmail);
      toast.success('Field edits saved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save edits');
    } finally {
      setSavingFields(false);
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    const setDeciding = decision === 'APPROVED' ? setDecidingApprove : setDecidingReject;
    setDeciding(true);
    try {
      if (!isUsingMockData) {
        await submitDecision(caseData.id, decision, [], userEmail);
      }
      setLocalStatus(decision);
      toast.success(`Case ${decision.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${decision.toLowerCase()} case`);
    } finally {
      setDeciding(false);
    }
  };

  const handleDownloadJSON = () => {
    const data = apiCase || caseData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseData.id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Case Detail</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{caseData.id}</span>
        </div>

        {!apiCase && isFirebaseConfigured && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <span>Demo Mode — showing sample data. Upload a document to see real OCR results.</span>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Verification Report</h1>
          <Button variant="outline" size="sm" onClick={handleDownloadJSON}><Download className="mr-2 h-4 w-4" />Download Report JSON</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-3">
            {/* Document Preview */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex h-48 items-center justify-center rounded-lg bg-secondary">
                  <div className="text-center text-muted-foreground">
                    <ScanSearch className="mx-auto mb-2 h-10 w-10" />
                    <p className="text-sm">Document Preview — {caseData.documentType}</p>
                    <p className="text-xs">aadhaar_scan.pdf</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Fields */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Extracted Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Field</th>
                        <th className="pb-2 font-medium">Value</th>
                        <th className="pb-2 font-medium">Confidence</th>
                        <th className="pb-2 font-medium hidden md:table-cell">Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((f, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2.5 text-muted-foreground">{f.name}</td>
                          <td className="py-2.5">
                            <Input
                              defaultValue={f.value}
                              ref={el => { if (apiCase?.extractedFields?.[i]) fieldRefs.current[apiCase.extractedFields[i].key] = el; }}
                              className="h-8 max-w-[200px] bg-secondary text-foreground"
                            />
                          </td>
                          <td className="py-2.5"><ConfidenceBadge confidence={f.confidence} /></td>
                          <td className="py-2.5 text-xs text-muted-foreground hidden md:table-cell">{f.evidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-4 border-primary/30 text-primary hover:bg-primary/10" onClick={handleSaveEdits} disabled={savingFields}>
                  {savingFields ? 'Saving…' : 'Save Edits'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary */}
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Case ID</p>
                    <p className="font-mono font-bold text-foreground">{caseData.id}</p>
                  </div>
                  <StatusBadge status={caseData.status as CaseStatus} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Document Type</p>
                  <p className="text-foreground">{caseData.documentType} <Pencil className="inline h-3 w-3 text-muted-foreground ml-1" /></p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none"
                          stroke={caseData.riskScore < 40 ? 'hsl(var(--success))' : caseData.riskScore < 70 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                          strokeWidth="3" strokeDasharray={`${caseData.riskScore} ${100 - caseData.riskScore}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{caseData.riskScore}</span>
                    </div>
                    <RiskBadge band={caseData.riskBand} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleDecision('APPROVED')} disabled={decidingApprove}>
                    <CheckCircle className="mr-1 h-4 w-4" />{decidingApprove ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDecision('REJECTED')} disabled={decidingReject}>
                    <XCircle className="mr-1 h-4 w-4" />{decidingReject ? 'Rejecting…' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Flags */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Validation & Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validations.map((v, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                    <button className="flex w-full items-center gap-2 text-left" onClick={() => setExpandedRule(expandedRule === v.ruleId ? null : v.ruleId)}>
                      {v.severity === 'PASS' ? <CheckCircle className="h-4 w-4 shrink-0 text-success" /> : v.severity === 'WARN' ? <AlertTriangle className="h-4 w-4 shrink-0 text-warning" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                      <span className="flex-1 text-sm text-foreground">{v.message}</span>
                      <SeverityBadge severity={v.severity} />
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedRule === v.ruleId ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedRule === v.ruleId && (
                      <div className="mt-2 rounded bg-background p-2 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px] text-primary">{v.ruleId}</span>
                        <p className="mt-1">{v.explain}</p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="mb-2 text-sm font-medium text-foreground">Authenticity Checks</p>
                  <div className="grid grid-cols-2 gap-2">
                    {authenticityChecks.map((a, i) => (
                      <div key={i} className="rounded-lg bg-secondary/50 p-2 text-center">
                        <p className="text-xs text-muted-foreground">{a.label}</p>
                        <Badge variant="outline" className={`mt-1 border-0 text-xs ${a.status === 'Detected' ? 'bg-success/20 text-success' : a.status === 'Uncertain' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'}`}>
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Timeline */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Audit Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
                  {timeline.map((e, i) => {
                    const Icon = eventIcons[e.event] || Clock;
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
                          <Icon className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">{e.event}</Badge>
                            <span className="text-[10px] text-muted-foreground">{e.timestamp}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-foreground">{e.description}</p>
                          <p className="text-[10px] text-muted-foreground">{e.actor}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;
