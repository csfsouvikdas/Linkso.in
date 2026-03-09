import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdPlaceholder } from "@/components/AdBanner";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TreesIcon, ArrowUpRight, Zap, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const STATS = [
  { value: "10K+",  label: "Creators",    color: "#1ed760", bg: "bg-green-50" },
  { value: "2M+",   label: "Link Clicks", color: "#111827", bg: "bg-gray-50" },
  { value: "150+",  label: "Countries",   color: "#111827", bg: "bg-gray-50" },
  { value: "99.9%", label: "Uptime",      color: "#1ed760", bg: "bg-green-50" },
];

const MOSAIC = [
  { label: "Creator Profiles",   emoji: "🎨", span: "md:col-span-2 md:row-span-2", h: "h-64 md:h-full", gradient: "from-emerald-400 to-green-600" },
  { label: "Analytics",          emoji: "📊", span: "md:col-span-1 md:row-span-1", h: "h-40",           gradient: "from-slate-800 to-slate-900" },
  { label: "Pro Features",       emoji: "⚡", span: "md:col-span-1 md:row-span-1", h: "h-40",           gradient: "from-[#1ed760] to-emerald-500" },
  { label: "Custom Design",      emoji: "🖼️", span: "md:col-span-1 md:row-span-2", h: "h-64 md:h-full", gradient: "from-indigo-500 to-blue-600" },
  { label: "Mobile First",       emoji: "📱", span: "md:col-span-1 md:row-span-1", h: "h-40",           gradient: "from-slate-100 to-slate-200", text: "text-slate-900" },
  { label: "QR Codes",           emoji: "◼️", span: "md:col-span-1 md:row-span-1", h: "h-40",           gradient: "from-rose-400 to-pink-500" },
];

const TEAM = [
  { initials: "SD", name: "Souvik D.",  role: "Founder & CEO",       g: "from-gray-900 to-slate-800" },
  { initials: "SM", name: "Sumeet M.",  role: "Head of Design",      g: "from-[#1ed760] to-emerald-600" },
  { initials: "AT", name: "Abhay S T.",  role: "Lead Engineer",       g: "from-gray-900 to-slate-800" },
  { initials: "ZK", name: "Zaheer K.",  role: "Growth & Marketing",  g: "from-gray-200 to-gray-300" },
];

const IS_PRO = false;

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] overflow-x-hidden font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center pt-24 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold mb-8 tracking-wider uppercase">
              <TreesIcon className="h-4 w-4" /> Our Story
            </span>
            <h1 className="text-5xl md:text-[92px] font-bold tracking-tight leading-[0.95] text-[#111827]">
              We help creators<br />
              <span className="text-[#1ed760]">own their link.</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            One link. One page. Everything you are. We built Linkso so you could share everything you do from a single, beautiful page.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 flex-wrap pt-4">
            <Link to="/signup" className="px-10 py-5 rounded-full font-bold bg-[#1ed760] text-[#111827] hover:scale-105 transition-all shadow-xl shadow-green-500/20 text-lg flex items-center gap-2">
              Get started free <ArrowUpRight className="h-5 w-5" />
            </Link>
            <Link to="/upgrade" className="px-10 py-5 rounded-full font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#1ed760] fill-[#1ed760]" /> Explore Pro
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── AD (free) ── */}
      <div className="container mx-auto px-4 py-8">
        <AdPlaceholder isPro={IS_PRO} label="Upgrade Pro to remove ads" />
      </div>

      {/* ── STATS ── */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`${s.bg} rounded-[32px] p-10 text-center transition-transform hover:scale-[1.02] cursor-default`}>
                <div className="text-5xl font-bold mb-2 tabular-nums" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOSAIC GRID ── */}
      <section className="py-28 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1ed760]">What we've built</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111827]">A platform that <br />grows with you.</h2>
          </div>
          <Link to="/upgrade" className="flex items-center gap-2 text-lg font-bold text-[#1ed760] hover:underline transition-all group">
            See all Pro features <ArrowUpRight className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-4 md:grid-rows-3 gap-6 md:h-[600px]">
          {MOSAIC.map((tile, i) => (
            <motion.div key={tile.label} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-[40px] shadow-sm cursor-pointer group ${tile.span} ${tile.h} ${tile.gradient} bg-gradient-to-br`}>
              <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                <span className="text-5xl">{tile.emoji}</span>
                <div className="flex items-center justify-between">
                  <p className={`font-bold text-2xl leading-tight ${tile.text || 'text-white'}`}>{tile.label}</p>
                  <div className={`p-2 rounded-full bg-white/20 backdrop-blur-md group-hover:scale-110 transition-transform ${tile.text || 'text-white'}`}>
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1ed760]">The Mission</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-tight">Built for the<br />creator generation.</h2>
              <p className="text-lg text-gray-500 leading-relaxed font-medium">Linkso started with a simple idea: social media bios only allow one link — but creators have so much more to share.</p>
              <p className="text-lg text-gray-500 leading-relaxed font-medium">Whether you're a musician, a designer, or an entrepreneur — we make it effortless to connect your audience to everything you do.</p>
              <div className="flex items-center gap-3 pt-4">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Made with love in India 🇮🇳</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[400px]">
              {[
                { bg: "from-indigo-600 to-blue-700", rotate: "-rotate-6", z: "z-10", title: "@designer_maya", links: ["Portfolio", "Dribbble"] },
                { bg: "from-emerald-500 to-[#1ed760]", rotate: "rotate-3",  z: "z-20", title: "@musicbyalex", links: ["Spotify", "Tour"] },
                { bg: "from-[#111827] to-slate-800", rotate: "rotate-0",  z: "z-30", title: "@techwithriya", links: ["Newsletter", "GitHub"] },
              ].map((card, i) => (
                <div key={i} className={`absolute inset-0 rounded-[48px] bg-gradient-to-br ${card.bg} ${card.rotate} ${card.z} p-10 shadow-2xl border border-white/10 flex flex-col justify-between transform transition-transform hover:scale-105 cursor-pointer`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white uppercase">{card.title[1]}</div>
                    <p className="font-bold text-white text-lg">{card.title}</p>
                  </div>
                  <div className="space-y-3">
                    {card.links.map(l => <div key={l} className="h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center px-5 text-white font-bold text-sm">{l}</div>)}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-32 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">The People</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111827]">Passionate about creators.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {TEAM.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group rounded-[40px] bg-white border border-gray-100 p-10 text-center hover:shadow-xl transition-all cursor-default">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${t.g} mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform`}>{t.initials}</div>
                <p className="font-bold text-xl text-[#111827]">{t.name}</p>
                <p className="text-sm font-bold text-[#1ed760] mt-1 uppercase tracking-widest">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-8">
                <Globe className="h-10 w-10 text-[#1ed760]" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#111827]">Join 10,000+ creators</h2>
            <p className="text-gray-500 text-xl mb-12 max-w-lg mx-auto font-medium">Your audience is waiting. Give them one link to find everything you do.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup" className="px-12 py-6 rounded-full font-bold bg-[#1ed760] text-[#111827] hover:scale-105 transition-all shadow-xl shadow-green-500/20 text-xl flex items-center gap-2">
                Create your Linkso <ArrowUpRight className="h-6 w-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}