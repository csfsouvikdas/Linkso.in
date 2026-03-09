import { motion } from "framer-motion";
import { UserPlus, LinkIcon, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign up & claim your URL",
    description:
      "Create your free account in seconds and claim linkhub.app/yourname before someone else does.",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.30)",

    visual: (
      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-emerald-800/30 border border-emerald-500/20 flex items-center justify-center gap-3 p-4">

        <div className="flex-1 space-y-2">
          <div className="h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/20 flex items-center px-3 gap-2">
            <span className="text-xs text-emerald-400 font-mono">
              linkhub.app/
            </span>
            <span className="text-xs text-white font-bold">yourname</span>
          </div>

          <div className="h-7 rounded-lg bg-white/5 flex items-center px-3">
            <span className="text-xs text-white/30">••••••••••</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <ArrowRight className="h-5 w-5 text-black" />
        </div>
      </div>
    ),
  },

  {
    icon: LinkIcon,
    step: "02",
    title: "Add all your links",
    description:
      "Paste your social media, website, and content links. We auto-detect the platform and show the right icon.",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.10)",
    border: "rgba(129,140,248,0.30)",

    visual: (
      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-violet-900/60 to-violet-800/30 border border-violet-500/20 p-4 space-y-2">
        {[
          { platform: "🎵", label: "Spotify", color: "#1ed760" },
          { platform: "📸", label: "Instagram", color: "#e1306c" },
          { platform: "▶️", label: "YouTube", color: "#ff0000" },
        ].map((l) => (
          <div
            key={l.label}
            className="h-7 rounded-lg bg-white/5 border border-white/[0.08] flex items-center px-3 gap-2"
          >
            <span className="text-sm">{l.platform}</span>

            <span className="text-xs font-medium text-white/70">
              {l.label}
            </span>

            <div
              className="ml-auto w-2 h-2 rounded-full"
              style={{ background: l.color }}
            />
          </div>
        ))}
      </div>
    ),
  },

  {
    icon: Share2,
    step: "03",
    title: "Share one link everywhere",
    description:
      "Copy your LinkHub URL and add it to Instagram, TikTok, Twitter or your email signature.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.30)",

    visual: (
      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-amber-900/60 to-amber-800/30 border border-amber-500/20 flex items-center justify-center gap-3 p-4">
        <div className="flex gap-3">
          {["📸", "🎵", "🐦", "💼", "📧"].map((emoji, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 1.6,
                delay: i * 0.15,
                repeat: Infinity,
              }}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-28 border-t border-white/[0.06] relative overflow-hidden"
    >

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[400px] bg-violet-500/10 blur-[px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full border border-black/ bg-black/5 text-xs font-bold text-black 0 mb-4 tracking-wider uppercase">
            Setup in 60 seconds
          </span>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            How it{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>

          <p className="text-black/40 max-w-md mx-auto">
            Three steps from zero to live. Seriously, it's that fast.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">

          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-3 gap-6 relative">

            {/* animated connector */}
            <div className="absolute top-[52px] left-[calc(16.7%+20px)] right-[calc(16.7%+20px)] h-[2px] bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 opacity-40" />

            <motion.div
              className="absolute top-[52px] left-[calc(16.7%+20px)] right-[calc(16.7%+20px)] h-[2px]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                background:
                  "linear-gradient(90deg,#22c55e,#818cf8,#f59e0b)",
              }}
            />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}

                className="group relative overflow-hidden rounded-3xl border p-6 space-y-4 hover:-translate-y-2 transition-all duration-300 cursor-default backdrop-blur-lg hover:shadow-2xl"
                style={{
                  borderColor: step.border,
                  background: step.bg,
                }}
              >

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-70 transition duration-500 blur-2xl"
                  style={{ background: step.color }}
                />

                <div className="relative z-10">

                  <div className="flex items-center gap-3 mb-2">

                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border"
                      style={{
                        background: step.bg,
                        borderColor: step.border,
                        color: step.color,
                      }}
                    >
                      {step.step}
                    </div>

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: step.bg }}
                    >
                      <step.icon
                        className="h-5 w-5"
                        style={{ color: step.color }}
                      />
                    </div>
                  </div>

                  {step.visual}

                  <h3 className="text-base font-black text-white leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-white/45 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}

                className="rounded-2xl border p-5 space-y-3 backdrop-blur-lg"
                style={{
                  borderColor: step.border,
                  background: step.bg,
                }}
              >
                <div className="flex items-center gap-3">

                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      borderColor: step.border,
                      color: step.color,
                    }}
                  >
                    {step.step}
                  </div>

                  <h3 className="font-bold text-sm text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-white/45 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}

              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold shadow-lg hover:shadow-xl transition"
            >
              Create Your Link Page →
            </motion.button>

          </div>

        </div>
      </div>
    </section>
  );
}