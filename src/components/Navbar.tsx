import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TreesIcon } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <TreesIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-heading font-bold">Linktree</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Sign up free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
