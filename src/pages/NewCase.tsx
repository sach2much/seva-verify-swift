import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image, CheckCircle, Loader2, X } from 'lucide-react';
import { uploadDocument } from '@/lib/api';
import { toast } from 'sonner';

const processingSteps = ['Digitization', 'Classification', 'Field Extraction', 'Validation & Authenticity'];

const NewCase = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [languageHint, setLanguageHint] = useState('auto');
  const [docType, setDocType] = useState('auto');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF or JPEG file.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setProcessing(true);
    setCurrentStep(0);

    try {
      const result = await uploadDocument(file, languageHint, docType);

      // Animate stepper through remaining steps
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= processingSteps.length) {
          clearInterval(interval);
          setTimeout(() => navigate(`/case/${result.caseId}`), 800);
        } else {
          setCurrentStep(step);
        }
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      console.error('Upload error:', message);
      toast.error(message, { duration: 8000 });
      setProcessing(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Create New Verification Case</h1>

        {!processing ? (
          <div className="space-y-6">
            {/* Upload Zone */}
            <Card
              className={`border-2 border-dashed transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center py-16">
                <label className="cursor-pointer text-center">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  {file ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-foreground font-medium">Drop PDF or JPEG here or click to browse</p>
                      <p className="text-sm text-muted-foreground">Max 10MB</p>
                    </>
                  )}
                  <div className="mt-4 flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" /> PDF
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Image className="h-4 w-4" /> JPEG
                    </div>
                  </div>
                </label>
                {file && (
                  <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground hover:text-destructive" onClick={(e) => { e.preventDefault(); setFile(null); }}>
                    <X className="mr-1 h-4 w-4" /> Remove file
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Language Hint</Label>
                <Select value={languageHint} onValueChange={setLanguageHint}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="dl">Driving License</SelectItem>
                    <SelectItem value="ration">Ration Card</SelectItem>
                    <SelectItem value="birth">Birth Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full font-semibold" size="lg" disabled={!file} onClick={handleSubmit}>
              Create Case & Start Verification
            </Button>
          </div>
        ) : (
          /* Processing Stepper */
          <Card className="border-border bg-card">
            <CardContent className="py-10">
              <div className="space-y-6">
                {processingSteps.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone ? 'border-success bg-success/20' : isActive ? 'border-primary bg-primary/20' : 'border-border bg-secondary'
                      }`}>
                        {isDone ? <CheckCircle className="h-5 w-5 text-success" /> : isActive ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <span className="text-sm text-muted-foreground">{i + 1}</span>}
                      </div>
                      <div>
                        <p className={`font-medium ${isDone || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</p>
                        {isActive && <p className="text-sm text-primary">Processing…</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NewCase;
