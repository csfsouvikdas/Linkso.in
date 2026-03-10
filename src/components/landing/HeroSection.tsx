import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Free to use — upto 3 links
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-tight">
            One link.
            <br />
            <span className="text-gradient">Everything</span> you are.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg">
            Share all your socials, content, and links from a single beautiful page. 
            Trusted by creators, influencers, and professionals worldwide.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">
                Get Your Free Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/demo">See Example</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl" />
            <div className="relative w-72 glass rounded-[2.5rem] p-6 space-y-4 animate-float">
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-2xl font-heading font-bold">
                  JD
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold">Jane Doe</p>
                  <p className="text-sm text-muted-foreground">Creator & Designer</p>
                </div>
              </div>
              {["Instagram", "YouTube", "Portfolio", "Twitter"].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="w-full py-3 px-4 rounded-xl bg-secondary/80 text-center text-sm font-medium hover-lift cursor-pointer"
                >
                  {name}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
