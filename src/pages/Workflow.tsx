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

// Rows for Z-pattern: Row1 L→R, Row2 R→L, Row3 L→R
const pipelineRows: { nodes: typeof pipelineNodes; direction: 'ltr' | 'rtl' }[] = [
  { nodes: pipelineNodes.slice(0, 4), direction: 'ltr' },
  { nodes: pipelineNodes.slice(4, 8), direction: 'rtl' },
  { nodes: pipelineNodes.slice(8, 10), direction: 'ltr' },
];

const TILE_W = 200;
const GAP = 40; // arrow gap between tiles

const PipelineTile = ({ node }: { node: typeof pipelineNodes[0] }) => (
  <Card className="border border-border bg-card" style={{ width: TILE_W }}>
    <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${node.color.split(' ')[0]}`}>
        <node.icon className={`h-5 w-5 ${node.color.split(' ')[1]}`} />
      </div>
      <p className="text-sm font-semibold leading-tight text-foreground">{node.title}</p>
      <p className="text-[11px] leading-snug text-muted-foreground">{node.subtitle}</p>
    </CardContent>
  </Card>
);

/* Elbow connector between rows: 3-segment right-angle path */
const ElbowConnector = ({ side }: { side: 'right' | 'left' }) => {
  const isRight = side === 'right';
  return (
    <div className="relative w-full" style={{ height: 48 }}>
      {/* SVG spanning full width so we can position the elbow at the correct side */}
      <svg className="absolute inset-0 h-full w-full overflow-visible text-muted-foreground/40">
        {isRight ? (
          <>
            {/* From center-bottom of last tile in row → right edge, down, then to center-top of last tile in next row */}
            <line x1="50%" y1="0" x2="calc(50% + 14px)" y2="0" stroke="currentColor" strokeWidth="2" />
            <line x1="calc(50% + 14px)" y1="0" x2="calc(50% + 14px)" y2="100%" stroke="currentColor" strokeWidth="2" />
            <line x1="calc(50% + 14px)" y1="100%" x2="50%" y2="100%" stroke="currentColor" strokeWidth="2" />
            {/* Arrowhead pointing down-left */}
            <polygon points="calc(50% - 4), calc(100% - 4) calc(50% + 4), calc(100% - 4) 50%, 100%" fill="currentColor" />
          </>
        ) : null}
      </svg>
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
          const isRtl = row.direction === 'rtl';
          const displayNodes = isRtl ? [...row.nodes].reverse() : row.nodes;
          const totalWidth = displayNodes.length * TILE_W + (displayNodes.length - 1) * GAP;
          return (
            <div key={ri} className="flex flex-col items-center">
              {/* Row of tiles */}
              <div className="flex items-center">
                {displayNodes.map((node, ci) => (
                  <div key={ci} className="flex items-center">
                    {ci > 0 && (
                      <div className="flex items-center" style={{ width: GAP }}>
                        <div className="h-[2px] flex-1 bg-muted-foreground/30" />
                        {isRtl ? (
                          <ArrowRight className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground/50" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        )}
                      </div>
                    )}
                    <PipelineTile node={node} />
                  </div>
                ))}
              </div>
              {/* Elbow connector: from right-center of node 4, out right, down, then left into right-center of node 5 */}
              {ri === 0 && (
                <div className="relative" style={{ width: totalWidth, height: 48 }}>
                  <svg
                    className="absolute text-muted-foreground/40"
                    style={{ top: -60, right: -40, width: 40, height: 48 + 120 }}
                    viewBox="0 0 40 168"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal line going right from node 4 right edge */}
                    <line x1="0" y1="60" x2="24" y2="60" stroke="currentColor" strokeWidth="2" />
                    {/* Vertical line going down */}
                    <line x1="24" y1="60" x2="24" y2="108" stroke="currentColor" strokeWidth="2" />
                    {/* Horizontal line going left into node 5 */}
                    <line x1="24" y1="108" x2="4" y2="108" stroke="currentColor" strokeWidth="2" />
                    {/* Arrowhead pointing left */}
                    <polygon points="8,104 8,112 0,108" fill="currentColor" />
                  </svg>
                </div>
              )}
              {/* Spacing between other rows */}
              {ri === 1 && ri < pipelineRows.length - 1 && <div className="h-6" />}
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
