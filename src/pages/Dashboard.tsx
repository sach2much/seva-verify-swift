import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { StatusBadge, RiskBadge } from '@/components/StatusBadges';
import { mockCases, type CaseStatus, type DocType } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileCheck, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const stats = [
  { icon: FileCheck, label: 'Total Cases', value: '1,247', color: 'text-info' },
  { icon: Clock, label: 'Pending Review', value: '23', color: 'text-warning' },
  { icon: CheckCircle, label: 'Approved Today', value: '18', color: 'text-success' },
  { icon: XCircle, label: 'Rejected Today', value: '3', color: 'text-destructive' },
];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docFilter, setDocFilter] = useState<string>('all');

  const filtered = mockCases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (docFilter !== 'all' && c.documentType !== docFilter) return false;
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.applicantName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Link to="/new-case">
            <Button><Plus className="mr-2 h-4 w-4" />New Case</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                {filtered.map(c => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
