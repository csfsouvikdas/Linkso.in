import { Link, useNavigate } from "react-router-dom";
import { TreesIcon } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-10">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <TreesIcon className="h-6 w-6 text-primary" />
              <span className="text-lg font-heading font-bold">Linkso</span>
            </div>
            <p className="text-sm text-muted-foreground">
              One link. Everything you are.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading font-semibold mb-3">Product</h4>

            <ul className="space-y-2 text-sm text-muted-foreground">

              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
              </li>

              <li>
                <Link
                  to="/blog"
                  className="hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>

            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold mb-3">Company</h4>

            <ul className="space-y-2 text-sm text-muted-foreground">

              <li>
                <Link
                  to="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-3">Legal</h4>

            <ul className="space-y-2 text-sm text-muted-foreground">

              <li>
                <Link
                  to="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 Linkso. All rights reserved.
        </div>

      </div>
    </footer>
  );
}