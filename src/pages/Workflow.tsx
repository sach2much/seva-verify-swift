import AppNavbar from '@/components/AppNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload, Settings, ScanSearch, Layers, FileOutput, ShieldCheck, FileCheck, Monitor,
  ArrowDown, Cpu, Webhook
} from 'lucide-react';

const pipelineNodes = [
  { icon: Upload, title: 'Document Upload', subtitle: 'PDF / JPEG → Firebase Storage', color: 'bg-info/20 text-info border-info/30' },
  { icon: Webhook, title: 'n8n Intake Webhook', subtitle: 'Case created in Firestore', color: 'bg-info/20 text-info border-info/30' },
  { icon: Settings, title: 'Preprocessing', subtitle: 'Deskew / Contrast Enhancement', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { icon: ScanSearch, title: 'OCR Engine', subtitle: 'Google Vision — en + mr-IN', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { icon: Layers, title: 'Document Classification', subtitle: 'GPT-4o-mini + Template Matching', color: 'bg-primary/20 text-primary border-primary/30' },
  { icon: FileOutput, title: 'Field Extraction', subtitle: 'LLM structured JSON + confidence', color: 'bg-primary/20 text-primary border-primary/30' },
  { icon: ShieldCheck, title: 'Rule-Based Validation', subtitle: 'Regex, date, format, cross-field', color: 'bg-success/20 text-success border-success/30' },
  { icon: Cpu, title: 'Authenticity Heuristics', subtitle: 'Stamp / signature / duplicate / layout', color: 'bg-success/20 text-success border-success/30' },
  { icon: FileCheck, title: 'Report Assembly', subtitle: 'Firestore case update', color: 'bg-teal/20 text-teal border-teal/30' },
  { icon: Monitor, title: 'Lovable UI Render', subtitle: 'GET /api/cases/{caseId}', color: 'bg-teal/20 text-teal border-teal/30' },
];

const techStack = [
  { layer: 'Frontend', tool: 'Lovable (React + TypeScript)', purpose: 'Operator & Supervisor dashboard' },
  { layer: 'Orchestration', tool: 'n8n', purpose: 'Workflow automation & webhooks' },
  { layer: 'Storage', tool: 'Firebase + Firestore', purpose: 'Document storage & case database' },
  { layer: 'OCR', tool: 'Google Vision API', purpose: 'Text extraction (English + Marathi)' },
  { layer: 'LLM', tool: 'GPT-4o-mini', purpose: 'Classification & structured extraction' },
  { layer: 'Languages', tool: 'English + Marathi', purpose: 'Multi-language OCR and UI support' },
];

const workflowModules = [
  { id: '01_intake', title: 'Intake Webhook', desc: 'Receives upload event, creates Firestore case record, triggers processing pipeline.' },
  { id: '02_process_ocr_classify', title: 'OCR + Classify', desc: 'Runs preprocessing, calls Google Vision API, classifies document type with LLM.' },
  { id: '03_extract_validate', title: 'Extract + Validate', desc: 'Extracts structured fields with confidence scores, runs rule-based validation checks.' },
  { id: '04_report_writeout', title: 'Report Writeout', desc: 'Assembles verification report JSON, writes results back to Firestore case record.' },
  { id: '05_operator_override', title: 'Operator Override', desc: 'Handles manual edits, decision events, and audit log entries from the operator UI.' },
];

const Workflow = () => (
  <div className="min-h-screen bg-background">
    <AppNavbar />
    <main className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Platform Architecture & Workflow</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">End-to-end document verification pipeline — from upload to verified report.</p>
      </div>

      {/* Pipeline */}
      <h2 className="mb-6 text-lg font-semibold text-foreground">Processing Pipeline</h2>
      <div className="mb-14 flex flex-col items-center gap-0">
        {pipelineNodes.map((node, i) => (
          <div key={i} className="flex w-full max-w-lg flex-col items-center">
            <Card className="w-full border border-border bg-card">
              <CardContent className="flex items-center gap-4 px-5 py-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${node.color.split(' ')[0]}`}>
                  <node.icon className={`h-5 w-5 ${node.color.split(' ')[1]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{node.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{node.subtitle}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-border font-mono text-[10px] text-muted-foreground">
                  Step {String(i + 1).padStart(2, '0')}
                </Badge>
              </CardContent>
            </Card>
            {i < pipelineNodes.length - 1 && (
              <div className="flex h-6 items-center justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground/60" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <h2 className="mb-6 text-lg font-semibold text-foreground">Tech Stack</h2>
      <Card className="mb-14 border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layer</TableHead>
                <TableHead className="w-[220px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tool</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techStack.map((r, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="text-sm font-medium text-foreground">{r.layer}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{r.tool}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* n8n Workflow Modules */}
      <h2 className="mb-6 text-lg font-semibold text-foreground">n8n Workflow Modules</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflowModules.map(m => (
          <Card key={m.id} className="flex flex-col border-border bg-gradient-card card-hover">
            <CardContent className="flex flex-1 flex-col p-5">
              <Badge variant="outline" className="mb-3 w-fit border-border font-mono text-[11px] text-primary">{m.id}</Badge>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{m.title}</h3>
              <p className="mt-auto text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Workflow;
