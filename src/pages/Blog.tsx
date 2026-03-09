import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdPlaceholder } from "@/components/AdBanner";
import { motion } from "framer-motion";
import { useState } from "react";
import { CalendarDays, ArrowUpRight, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

// Updated Colors for a light theme
const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  Growth:   { text: "#065f46", bg: "#d1fae5", border: "#a7f3d0", glow: "rgba(30,215,96,0.1)" },
  Design:   { text: "#3730a3", bg: "#e0e7ff", border: "#c7d2fe", glow: "rgba(129,140,248,0.1)" },
  Trends:   { text: "#92400e", bg: "#fef3c7", border: "#fde68a", glow: "rgba(245,158,11,0.1)" },
  Product:  { text: "#9d174d", bg: "#fce7f3", border: "#fbcfe8", glow: "rgba(236,72,153,0.1)" },
  Insights: { text: "#155e75", bg: "#ecfeff", border: "#cffafe", glow: "rgba(6,182,212,0.1)" },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Growth:   "from-[#1ed760] to-[#059669]",
  Design:   "from-indigo-400 to-violet-500",
  Trends:   "from-amber-400 to-orange-500",
  Product:  "from-pink-400 to-rose-500",
  Insights: "from-cyan-400 to-blue-500",
};

const posts = [
  { title: "How to Grow Your Audience with a Link in Bio", date: "Mar 5, 2026", readTime: "5 min", excerpt: "Discover proven strategies to drive more traffic through your Linkso page and convert visitors into followers.", category: "Growth", featured: true },
  { title: "5 Tips for a Stunning Profile Page",           date: "Feb 28, 2026", readTime: "4 min", excerpt: "Make your Linkso page stand out with these design tips that top creators swear by.", category: "Design" },
  { title: "The Rise of the Creator Economy",             date: "Feb 20, 2026", readTime: "7 min", excerpt: "How independent creators are building businesses around their personal brands — and how Linkso fits in.", category: "Trends" },
  { title: "New Feature: Link Click Analytics",           date: "Feb 12, 2026", readTime: "3 min", excerpt: "Track which links your audience clicks the most with our new built-in analytics dashboard.", category: "Product" },
  { title: "Why Every Professional Needs a Link in Bio",  date: "Feb 5, 2026",  readTime: "6 min", excerpt: "It's not just for influencers — here's why professionals across every industry are using Linkso.", category: "Insights" },
];

const CATEGORIES = ["All", ...Object.keys(CATEGORY_COLORS)];
const IS_PRO = false;

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? posts : posts.filter(p => p.category === active);
  const featured = posts.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || active !== "All");

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold mb-6 tracking-wide">
              ✦ INSIGHTS & UPDATES
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
              The Creator<br />
              <span className="text-[#1ed760]">Playbook.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">Tips, product updates, and creator strategies from the Linkso team.</p>
          </motion.div>
        </div>
      </section>

      {/* ── AD top (free) ── */}
      <div className="container mx-auto px-4 py-8">
        <AdPlaceholder isPro={IS_PRO} label="Sponsor this space · Upgrade Pro to remove ads" />
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className="shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all border"
              style={active === cat && cat !== "All"
                ? { background: CATEGORY_COLORS[cat]?.bg, color: CATEGORY_COLORS[cat]?.text, borderColor: CATEGORY_COLORS[cat]?.border }
                : active === cat
                ? { background: "#111827", color: "#fff", borderColor: "#111827" }
                : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 space-y-12">

        {/* ── FEATURED POST ── */}
        {active === "All" && featured && (
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[48px] bg-white border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500">
            <div className="relative z-10 p-8 md:p-16 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: CATEGORY_COLORS[featured.category].bg, color: CATEGORY_COLORS[featured.category].text }}>{featured.category}</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">✦ Featured</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[#111827]">{featured.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{featured.date}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{featured.readTime} read</span>
                </div>
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1ed760] text-[#111827] font-bold group-hover:scale-105 transition-all">
                  Read article <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center">
                <div className={`w-64 h-64 rounded-[40px] bg-gradient-to-br ${CATEGORY_GRADIENTS[featured.category]} flex items-center justify-center text-8xl shadow-2xl group-hover:rotate-3 transition-transform duration-500`}>
                  🚀
                </div>
              </div>
            </div>
          </motion.article>
        )}

        {/* ── POST GRID ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => {
            const c = CATEGORY_COLORS[post.category];
            return (
              <motion.article key={post.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="group relative overflow-hidden rounded-[32px] bg-white border border-gray-100 p-8 space-y-6 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: c.bg, color: c.text }}>{post.category}</span>
                    <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:text-[#1ed760] transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[post.category]} opacity-90 flex items-center justify-center text-5xl shadow-inner`}>
                    {post.category === "Growth" ? "📈" : post.category === "Design" ? "🎨" : post.category === "Trends" ? "🔥" : post.category === "Product" ? "⚙️" : "💡"}
                  </div>
                  
                  <h2 className="font-bold text-xl leading-tight text-[#111827] group-hover:text-[#1ed760] transition-colors">{post.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  
                  <div className="pt-4 flex items-center gap-4 text-xs text-gray-400 font-semibold border-t border-gray-50">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{post.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── PRO CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-[48px] bg-[#111827] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          {/* Subtle green glow in the dark CTA */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1ed760] opacity-10 blur-[100px]" />
          
          <div className="w-20 h-20 rounded-[24px] bg-[#1ed760] flex items-center justify-center mx-auto mb-4">
            <Zap className="h-10 w-10 text-[#111827] fill-[#111827]" />
          </div>
          <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Go Pro. Remove ads.<br /><span className="text-[#1ed760]">Unlock everything.</span></h3>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">Custom backgrounds, verified badge, QR codes, and advanced analytics — all for just ₹99/month.</p>
          <Link to="/upgrade" className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold bg-[#1ed760] text-[#111827] hover:scale-105 transition-all shadow-xl shadow-[#1ed760]/20 text-lg">
            <Zap className="h-5 w-5 fill-current" /> Upgrade to Pro · ₹99/mo
          </Link>
        </motion.div>

        {/* ── AD bottom (free) ── */}
        <AdPlaceholder isPro={IS_PRO} label="Browse ad-free with Pro" />
      </div>

      <Footer />
    </div>
  );
}