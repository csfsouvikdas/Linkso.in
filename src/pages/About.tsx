import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold">
                About <span className="text-gradient">Linktree</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                We're on a mission to help creators, professionals, and influencers share everything they are — from one simple link.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "10,000+ Creators", desc: "Trusted by creators across every platform and niche." },
                { icon: Heart, title: "Built with Love", desc: "Crafted by a passionate team that cares about creators." },
                { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed so your audience never waits." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass rounded-2xl p-8 space-y-4">
              <h2 className="text-2xl font-heading font-bold">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Linktree started with a simple idea: social media bios only allow one link — but creators have so much more to share. We built a platform that lets anyone create a beautiful, mobile-optimized page with all their important links in one place.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a musician sharing your latest tracks, a designer showcasing your portfolio, or an entrepreneur linking to your products — Linktree makes it effortless to connect your audience to everything you do.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
