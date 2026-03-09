// ── LegalLayout.tsx — shared component for Privacy & Terms ──────────────────
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdPlaceholder } from "@/components/AdBanner";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LegalLayoutProps {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  updated: string;
  sections: { title: string; content: string }[];
  accentColor: string;
  accentBg: string;
}

const IS_PRO = false;

export function LegalLayout({
  badge,
  title,
  titleHighlight,
  subtitle,
  updated,
  sections,
  accentColor,
  accentBg,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.06) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div
          className="absolute top-20 right-[20%] w-96 h-96 rounded-full blur-[160px] opacity-10 pointer-events-none"
          style={{ background: accentColor }}
        />

        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500 mb-6">
              {badge}
            </span>

            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-4">
              {title}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                }}
              >
                {titleHighlight}
              </span>
            </h1>

            <p className="text-gray-500">{subtitle}</p>
            <p className="text-xs text-gray-400 mt-2">Last updated: {updated}</p>
          </motion.div>
        </div>
      </section>

      {/* Ad top */}
      <div className="container mx-auto px-4 pb-6 max-w-3xl">
        <AdPlaceholder isPro={IS_PRO} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl pb-24 space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-gray-200 bg-white p-6 space-y-3 hover:border-gray-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black"
                style={{ background: accentBg, color: accentColor }}
              >
                {i + 1}
              </div>

              <div className="space-y-2 flex-1">
                <h2 className="font-bold text-base text-gray-900">
                  {section.title.replace(/^\d+\.\s/, "")}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Ad bottom */}
        <div className="pt-4">
          <AdPlaceholder
            isPro={IS_PRO}
            label="Upgrade to Pro for an ad-free experience"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}