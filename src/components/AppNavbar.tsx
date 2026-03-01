import { Shield, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AppNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">DocVerify India</span>
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link to="/new-case" className="text-sm text-muted-foreground transition-colors hover:text-foreground">New Case</Link>
            <Link to="/workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Workflow</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-primary/30 text-primary">Supervisor</Badge>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-muted-foreground">
            <LogOut className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
