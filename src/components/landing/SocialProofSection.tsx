import { motion } from "framer-motion";

const creators = [
  { name: "Alex Rivera", handle: "@alexr" },
  { name: "Sara Kim", handle: "@sarakim" },
  { name: "Marcus Chen", handle: "@marcusc" },
  { name: "Priya Patel", handle: "@priyap" },
  { name: "Jordan Blake", handle: "@jordanb" },
];

export function SocialProofSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex justify-center -space-x-3">
            {creators.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
              >
                {c.name.split(" ").map(n => n[0]).join("")}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">Trusted by <span className="text-gradient">10,000+</span> creators</p>
            <p className="text-muted-foreground mt-2">Influencers, designers, musicians, and entrepreneurs love Linktree.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
