import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Shield, ScanSearch, FileCheck, Layers, Stamp, AlertTriangle, ScrollText,
  Upload, Cpu, FileOutput, ClipboardCheck, ArrowRight, Zap, Globe, FileText,
  CreditCard, Car, UtensilsCrossed, Baby
} from 'lucide-react';

const features = [
  { icon: ScanSearch, title: 'Fine-tuned OCR', desc: 'English + Marathi support with region-optimized recognition for Indian government documents.' },
  { icon: Layers, title: 'Auto Document Classification', desc: 'Instantly identify Aadhaar, PAN, Driving License and more using LLM + template matching.' },
  { icon: FileCheck, title: 'Field Extraction with Confidence', desc: 'Structured JSON output with per-field confidence scores and evidence snippets.' },
  { icon: Stamp, title: 'Stamp & Signature Detection', desc: 'Heuristic analysis of official stamps and signatures for authenticity checks.' },
  { icon: AlertTriangle, title: 'Fraud & Tamper Heuristics', desc: 'Font inconsistency, layout deviation and metadata anomaly detection.' },
  { icon: ScrollText, title: 'Explainable Audit Trail', desc: 'Full event log from upload to decision — every step timestamped and attributed.' },
];

const steps = [
  { icon: Upload, title: 'Upload PDF or JPEG', desc: 'Drop your document' },
  { icon: Cpu, title: 'OCR + Classification', desc: 'AI-powered analysis' },
  { icon: FileOutput, title: 'Field Extraction + Validation', desc: 'Structured data out' },
  { icon: ClipboardCheck, title: 'Verification Report + Audit', desc: 'Decision-ready report' },
];

const documents = [
  { icon: CreditCard, name: 'Aadhaar Card', fields: 8, langs: ['EN', 'MR'] },
  { icon: FileText, name: 'PAN Card', fields: 6, langs: ['EN'] },
  { icon: Car, name: 'Driving License', fields: 10, langs: ['EN', 'MR'] },
  { icon: UtensilsCrossed, name: 'Ration Card', fields: 9, langs: ['EN', 'MR'] },
  { icon: Baby, name: 'Birth Certificate', fields: 7, langs: ['EN', 'MR'] },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="bg-gradient-hero circuit-pattern relative flex min-h-[85vh] items-center pt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-primary/30 bg-primary/10 text-primary">
              <Shield className="mr-1 h-3 w-3" /> Government-Grade Verification
            </Badge>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              AI-Powered Document Verification for{' '}
              <span className="text-gradient-saffron">Government Services</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Digitize, classify, validate and authenticate Aadhaar, PAN, Driving License, Ration Card and more — in under 90 seconds. Built for Seva Kendras, online portals and government departments.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button size="lg" className="glow-saffron px-8 text-base font-semibold">
                  Start Verifying <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/case/DVR-2026-00142">
                <Button size="lg" variant="outline" className="border-border px-8 text-base font-semibold text-foreground hover:bg-secondary">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 divide-y divide-border px-4 py-0 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { icon: Zap, value: '90 Sec', label: 'Average Processing' },
            { icon: Globe, value: 'English + Marathi', label: 'Languages Supported' },
            { icon: FileText, value: '5 Types', label: 'Documents Supported' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-center gap-4 py-6">
              <s.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Platform Capabilities</h2>
            <p className="text-muted-foreground">Enterprise-grade document intelligence, purpose-built for Indian governance.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Card key={i} className="card-hover border-border bg-gradient-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-y border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground">Four simple steps from document upload to verified report.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <Badge variant="outline" className="mb-2 border-border text-muted-foreground">Step {i + 1}</Badge>
                <h3 className="mb-1 font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < 3 && (
                  <ArrowRight className="absolute -right-4 top-8 hidden h-5 w-5 text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Supported Documents</h2>
            <p className="text-muted-foreground">Pre-trained models for India's most-used government IDs.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {documents.map((d, i) => (
              <Card key={i} className="card-hover border-border bg-gradient-card text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <d.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{d.name}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{d.fields} fields supported</p>
                  <div className="flex justify-center gap-1">
                    {d.langs.map(l => (
                      <Badge key={l} variant="outline" className="border-border text-xs text-muted-foreground">{l}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section id="integrations" className="border-y border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Integration-Ready REST API</h2>
            <p className="mb-8 text-muted-foreground">Integrate via REST API in minutes. Plug into any state government portal or scheme.</p>
          </div>
          <div className="mx-auto max-w-xl">
            <div className="overflow-hidden rounded-lg border border-border bg-navy-deep">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-2 text-xs text-muted-foreground">POST /api/cases</span>
              </div>
              <pre className="overflow-x-auto p-4 text-sm text-muted-foreground">
{`{
  "applicant_name": "Rajesh Kumar Sharma",
  "document_type": "aadhaar",
  "language_hint": "auto",
  "file_url": "https://storage.../aadhaar_scan.pdf",
  "callback_url": "https://portal.../webhook"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
