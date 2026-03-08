import { motion } from "framer-motion";
import { UserPlus, LinkIcon, Share2 } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Sign up & pick your username", description: "Create your free account in seconds and claim your unique URL." },
  { icon: LinkIcon, title: "Add all your links", description: "Paste your social media, website, and content links. We auto-detect the platform." },
  { icon: Share2, title: "Share your one link", description: "Copy your Linktree URL and add it to your bio everywhere." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            How it <span className="text-gradient">works</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">Get set up in under a minute. Seriously.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-sm font-semibold text-primary">Step {i + 1}</div>
              <h3 className="text-lg font-heading font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
