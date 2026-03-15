import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground">DocVerify India</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
          <a href="#integrations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Integrations</a>
          <a href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
        </div>

        <Link to="/login">
          <Button size="sm">Login</Button>
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;
