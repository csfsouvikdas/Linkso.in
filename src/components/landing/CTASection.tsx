import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl glass p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative space-y-6">
            <h2 className="text-3xl md:text-5xl font-heading font-bold">
              Claim your free <span className="text-gradient">Linktree</span> now
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join thousands of creators who use Linktree to share everything they do from one simple link.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">
                Get Started — It's Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
