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
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Platform Architecture & Workflow</h1>
      <p className="mb-8 text-muted-foreground">End-to-end document verification pipeline from upload to verified report.</p>

      {/* Pipeline */}
      <div className="mb-12 flex flex-col items-center">
        {pipelineNodes.map((node, i) => (
          <div key={i} className="flex flex-col items-center">
            <Card className={`w-full max-w-md border ${node.color} bg-card`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${node.color.split(' ')[0]}`}>
                  <node.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{node.title}</p>
                  <p className="text-sm text-muted-foreground">{node.subtitle}</p>
                </div>
                <Badge variant="outline" className="ml-auto border-border text-[10px] text-muted-foreground">{i + 1}</Badge>
              </CardContent>
            </Card>
            {i < pipelineNodes.length - 1 && (
              <ArrowDown className="my-2 h-5 w-5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <Card className="mb-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Layer</TableHead>
                <TableHead className="text-muted-foreground">Tool</TableHead>
                <TableHead className="text-muted-foreground">Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techStack.map((r, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="font-medium text-foreground">{r.layer}</TableCell>
                  <TableCell className="text-muted-foreground">{r.tool}</TableCell>
                  <TableCell className="text-muted-foreground">{r.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* n8n Workflow Modules */}
      <h2 className="mb-4 text-xl font-bold text-foreground">n8n Workflow Modules</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflowModules.map(m => (
          <Card key={m.id} className="border-border bg-gradient-card card-hover">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-2 border-border font-mono text-xs text-primary">{m.id}</Badge>
              <h3 className="mb-1 font-semibold text-foreground">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Workflow;
