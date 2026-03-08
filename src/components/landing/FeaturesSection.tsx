import { motion } from "framer-motion";
import { Link2, Palette, BarChart3, Smartphone, Sparkles, Globe } from "lucide-react";

const features = [
  { icon: Link2, title: "Custom Username URL", description: "Get a memorable link like linktree.app/yourname" },
  { icon: Sparkles, title: "Unlimited Links", description: "Add as many links as you need — no limits" },
  { icon: Palette, title: "Profile Customization", description: "Choose themes, colors, fonts, and button styles" },
  { icon: BarChart3, title: "Link Click Analytics", description: "See who clicks what and track your growth" },
  { icon: Globe, title: "Auto Platform Detection", description: "We detect Instagram, YouTube, TikTok icons automatically" },
  { icon: Smartphone, title: "Mobile Optimized", description: "Your page looks perfect on every device" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Everything you <span className="text-gradient">need</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">Powerful features to help you stand out and grow.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 space-y-3 hover-lift"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
