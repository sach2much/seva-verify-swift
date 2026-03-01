import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { StatusBadge, RiskBadge } from '@/components/StatusBadges';
import { mockCases, type CaseStatus, type DocType } from '@/data/mockData';
import { subscribeToCases, type Case as ApiCase } from '@/lib/api';
import { ENV } from '@/config/env';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileCheck, Clock, CheckCircle, XCircle, Eye, AlertTriangle, Inbox } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const isToday = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  } catch { return false; }
};

// Map API cases to the table format used by UI
const mapApiCase = (c: ApiCase) => ({
  id: c.caseId,
  applicantName: c.applicantName || 'Unknown',
  documentType: (c.docTypeFinal || c.docTypePredicted || 'Unknown') as DocType,
  status: c.status as CaseStatus,
  riskBand: c.riskBand,
  riskScore: c.riskScore,
  createdAt: c.createdAt,
});

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docFilter, setDocFilter] = useState<string>('all');
  const [liveCases, setLiveCases] = useState<ReturnType<typeof mapApiCase>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // If Firebase is not configured, fall back to mock data
    if (!ENV.FIREBASE_API_KEY) {
      setLiveCases(null);
      setDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToCases((cases) => {
        setLiveCases(cases.map(mapApiCase));
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setDemoMode(true);
      setLoading(false);
    }
  }, []);

  const cases = liveCases ?? mockCases;

  // Compute stats dynamically
  const totalCases = cases.length;
  const pendingReview = cases.filter(c => c.status === 'NEEDS_REVIEW').length;
  const approvedToday = cases.filter(c => c.status === 'APPROVED' && isToday(c.createdAt)).length;
  const rejectedToday = cases.filter(c => c.status === 'REJECTED' && isToday(c.createdAt)).length;

  const stats = [
    { icon: FileCheck, label: 'Total Cases', value: totalCases.toLocaleString(), numValue: totalCases, color: 'text-info', chartColor: 'hsl(210, 100%, 56%)' },
    { icon: Clock, label: 'Pending Review', value: pendingReview.toString(), numValue: pendingReview, color: 'text-warning', chartColor: 'hsl(38, 92%, 50%)' },
    { icon: CheckCircle, label: 'Approved Today', value: approvedToday.toString(), numValue: approvedToday, color: 'text-success', chartColor: 'hsl(142, 71%, 45%)' },
    { icon: XCircle, label: 'Rejected Today', value: rejectedToday.toString(), numValue: rejectedToday, color: 'text-destructive', chartColor: 'hsl(0, 84%, 60%)' },
  ];

  const donutData = stats.map(s => ({ name: s.label, value: s.numValue, color: s.chartColor }));

  const filtered = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (docFilter !== 'all' && c.documentType !== docFilter) return false;
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.applicantName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        {demoMode && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Running in demo mode — connect Firebase to see live data
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Link to="/new-case">
            <Button><Plus className="mr-2 h-4 w-4" />New Case</Button>
          </Link>
        </div>

        {/* Stats + Donut */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {stats.map((s, i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <p className="mb-2 text-sm font-semibold text-foreground">Case Distribution</p>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(216, 50%, 13%)', border: '1px solid hsl(216, 30%, 22%)', borderRadius: '8px', color: 'hsl(0, 0%, 95%)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by Case ID or Name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['RECEIVED','PROCESSING','READY','NEEDS_REVIEW','APPROVED','REJECTED','FAILED'] as CaseStatus[]).map(s => (
                <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Document Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {(['Aadhaar Card','PAN Card','Driving License','Ration Card','Birth Certificate'] as DocType[]).map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Case ID</TableHead>
                  <TableHead className="text-muted-foreground">Applicant</TableHead>
                  <TableHead className="text-muted-foreground">Document Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Risk</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="h-8 w-8" />
                        <p>No cases yet. Create your first case.</p>
                        <Link to="/new-case"><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Case</Button></Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-mono text-sm text-foreground">{c.id}</TableCell>
                      <TableCell className="text-foreground">{c.applicantName}</TableCell>
                      <TableCell className="text-muted-foreground">{c.documentType}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell><RiskBadge band={c.riskBand} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
                      <TableCell>
                        <Link to={`/case/${c.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
