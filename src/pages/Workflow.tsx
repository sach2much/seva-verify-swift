import AppNavbar from '@/components/AppNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload, Settings, ScanSearch, Layers, FileOutput, ShieldCheck, FileCheck, Monitor,
  ArrowRight, ArrowDown, Cpu, Webhook
} from 'lucide-react';

const pipelineNodes = [
  { icon: Upload, title: 'Document Upload', subtitle: 'PDF / JPEG → Firebase Storage', color: 'bg-info/20 text-info' },
  { icon: Webhook, title: 'n8n Intake Webhook', subtitle: 'Case created in Firestore', color: 'bg-info/20 text-info' },
  { icon: Settings, title: 'Preprocessing', subtitle: 'Deskew / Contrast Enhancement', color: 'bg-purple-500/20 text-purple-400' },
  { icon: ScanSearch, title: 'OCR Engine', subtitle: 'Google Vision — en + mr-IN', color: 'bg-purple-500/20 text-purple-400' },
  { icon: Layers, title: 'Document Classification', subtitle: 'GPT-4o-mini + Template Matching', color: 'bg-primary/20 text-primary' },
  { icon: FileOutput, title: 'Field Extraction', subtitle: 'LLM structured JSON + confidence', color: 'bg-primary/20 text-primary' },
  { icon: ShieldCheck, title: 'Rule-Based Validation', subtitle: 'Regex, date, format, cross-field', color: 'bg-success/20 text-success' },
  { icon: Cpu, title: 'Authenticity Heuristics', subtitle: 'Stamp / signature / duplicate / layout', color: 'bg-success/20 text-success' },
  { icon: FileCheck, title: 'Report Assembly', subtitle: 'Firestore case update', color: 'bg-teal/20 text-teal' },
  { icon: Monitor, title: 'Lovable UI Render', subtitle: 'GET /api/cases/{caseId}', color: 'bg-teal/20 text-teal' },
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

// Split into 3 rows: 4, 4, 2
const pipelineRows = [
  pipelineNodes.slice(0, 4),
  pipelineNodes.slice(4, 8),
  pipelineNodes.slice(8, 10),
];

const PipelineTile = ({ node }: { node: typeof pipelineNodes[0] }) => (
  <Card className="flex-1 border border-border bg-card">
    <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${node.color.split(' ')[0]}`}>
        <node.icon className={`h-5 w-5 ${node.color.split(' ')[1]}`} />
      </div>
      <p className="text-sm font-semibold leading-tight text-foreground">{node.title}</p>
      <p className="text-[11px] leading-snug text-muted-foreground">{node.subtitle}</p>
    </CardContent>
  </Card>
);
/* Elbow connector: ┐ then │ then └  (or mirrored) with 90° corners */
const ElbowConnector = ({ side }: { side: 'right' | 'left' }) => {
  const isRight = side === 'right';
  return (
    <div className={`flex w-full ${isRight ? 'justify-end pr-[88px]' : 'justify-start pl-[88px]'}`}>
      <div className="flex flex-col items-stretch" style={{ width: 28 }}>
        {/* Top horizontal + corner */}
        <div
          className={`h-4 border-muted-foreground/40 ${
            isRight ? 'border-r-2 border-t-2 rounded-tr' : 'border-l-2 border-t-2 rounded-tl'
          }`}
        />
        {/* Vertical middle */}
        <div className={`h-5 border-muted-foreground/40 ${isRight ? 'border-r-2' : 'border-l-2'}`} />
        {/* Bottom corner + horizontal */}
        <div
          className={`h-4 border-muted-foreground/40 ${
            isRight ? 'border-r-2 border-b-2 rounded-br' : 'border-l-2 border-b-2 rounded-bl'
          }`}
        />
      </div>
    </div>
  );
};

const Workflow = () => (
  <div className="min-h-screen bg-background">
    <AppNavbar />
    <main className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Platform Architecture & Workflow</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">End-to-end document verification pipeline — from upload to verified report.</p>
      </div>

      {/* Pipeline — 3 rows, Z-pattern */}
      <h2 className="mb-6 text-lg font-semibold text-foreground">Processing Pipeline</h2>
      <div className="mb-14 flex flex-col items-center gap-0">
        {pipelineRows.map((row, ri) => {
          const isReversed = ri % 2 === 1;
          const orderedRow = isReversed ? [...row].reverse() : row;
          return (
            <div key={ri} className="flex w-full flex-col items-center">
              <div className={`flex w-full items-stretch gap-0 ${isReversed ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                {orderedRow.map((node, ci) => (
                  <div key={ci} className="flex items-center">
                    {ci > 0 && (
                      <ArrowRight className={`mx-3 h-4 w-4 shrink-0 text-muted-foreground/50 ${isReversed ? 'rotate-180' : ''}`} />
                    )}
                    <div className="w-[200px]">
                      <PipelineTile node={node} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Elbow connector between rows */}
              {ri < pipelineRows.length - 1 && (
                <ElbowConnector side={isReversed ? 'left' : 'right'} />
              )}
            </div>
          );
        })}
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
