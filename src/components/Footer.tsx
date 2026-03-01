import { Shield } from 'lucide-react';

const Footer = () => (
  <footer id="contact" className="border-t border-border bg-navy-deep py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <p className="font-bold text-foreground">DocVerify India</p>
            <p className="text-xs text-muted-foreground">Governance-grade document intelligence</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how-it-works" className="hover:text-foreground">How It Works</a>
          <a href="#integrations" className="hover:text-foreground">API Docs</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 DocVerify India. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
