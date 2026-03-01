import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { StatusBadge, RiskBadge, SeverityBadge, ConfidenceBadge } from '@/components/StatusBadges';
import { sampleFields, validationResults, authenticityChecks, auditTimeline, mockCases } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight, Download, CheckCircle, AlertTriangle, XCircle,
  Upload as UploadIcon, ScanSearch, Layers, FileOutput, ShieldCheck, Pencil, Clock, ChevronDown
} from 'lucide-react';

const eventIcons: Record<string, typeof CheckCircle> = {
  UPLOAD: UploadIcon, OCR_COMPLETE: ScanSearch, CLASSIFICATION: Layers,
  EXTRACTION: FileOutput, VALIDATION: ShieldCheck, REVIEW: AlertTriangle,
  EDIT: Pencil, DECISION: CheckCircle,
};

const CaseDetail = () => {
  const { caseId } = useParams();
  const caseData = mockCases.find(c => c.id === caseId) || mockCases[0];
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

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

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Verification Report</h1>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download Report JSON</Button>
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
                      {sampleFields.map((f, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2.5 text-muted-foreground">{f.name}</td>
                          <td className="py-2.5"><Input defaultValue={f.value} className="h-8 max-w-[200px] bg-secondary text-foreground" /></td>
                          <td className="py-2.5"><ConfidenceBadge confidence={f.confidence} /></td>
                          <td className="py-2.5 text-xs text-muted-foreground hidden md:table-cell">{f.evidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-4 border-primary/30 text-primary hover:bg-primary/10">Save Edits</Button>
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
                  <StatusBadge status={caseData.status} />
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
                  <Button size="sm" className="flex-1 bg-success hover:bg-success/90 text-success-foreground"><CheckCircle className="mr-1 h-4 w-4" />Approve</Button>
                  <Button size="sm" variant="destructive" className="flex-1"><XCircle className="mr-1 h-4 w-4" />Reject</Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Flags */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Validation & Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validationResults.map((v, i) => (
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
                  {auditTimeline.map((e, i) => {
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
