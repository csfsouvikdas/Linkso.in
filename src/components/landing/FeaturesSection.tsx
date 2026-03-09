import { motion } from "framer-motion";
import { 
  Link2, Palette, BarChart3, Smartphone, Sparkles, 
  Globe, Zap, Star, QrCode, Shield, Type, Lock 
} from "lucide-react";
import { Link } from "react-router-dom";

// Free features - Updated with image-accurate colors
const FREE_FEATURES = [
  { icon: Link2,     title: "Custom Username URL",      desc: "Get a memorable link like linkso.app/yourname",         color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
  { icon: Sparkles,  title: "Up to 3 Links",            desc: "Add your most important links to your profile",           color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
  { icon: Palette,   title: "Basic Themes",             desc: "Choose from Light and Dark themes",                       color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
  { icon: BarChart3, title: "Basic Analytics",          desc: "See total profile views and link clicks",                 color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
  { icon: Globe,     title: "Auto Platform Detection",  desc: "We detect Instagram, YouTube, TikTok icons automatically",color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
  { icon: Smartphone,title: "Mobile Optimized",         desc: "Your page looks perfect on every device",                 color: "#1ed760", bg: "#f0fdf4", border: "#dcfce7" },
];

// Pro features — Clean Bento Grid
const PRO_BENTO = [
  { icon: Zap,      title: "Unlimited Links",         desc: "No limits on how many links you add",       span: "col-span-2", bg: "bg-emerald-50", text: "text-emerald-700", emoji: "⚡" },
  { icon: BarChart3,title: "Advanced Analytics",      desc: "CTR, top links, click charts & more",       span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "📊" },
  { icon: Star,     title: "Verified Badge",          desc: "Gold star next to your name",               span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "✦" },
  { icon: Palette,  title: "Gradient Theme",          desc: "Premium animated gradient backgrounds",     span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "🎨" },
  { icon: Type,     title: "Custom Fonts",            desc: "6 font families for your profile",          span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "Aa" },
  { icon: QrCode,   title: "QR Code",                 desc: "Downloadable QR for your profile",          span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "◼️" },
  { icon: Shield,   title: "Remove Branding",         desc: "No 'Made with Linkso' on your page",      span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "🚫" },
  { icon: Lock,     title: "Password Protection",     desc: "Lock your profile behind a password",       span: "col-span-1", bg: "bg-gray-50",    text: "text-gray-700",    emoji: "🔒" },
  { icon: Globe,    title: "Custom Domain",           desc: "Use your own domain for your Linkso",     span: "col-span-2", bg: "bg-emerald-50", text: "text-emerald-700", emoji: "🌐" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-[#ffffff] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* ── FREE FEATURES ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold mb-4 tracking-wide uppercase">
            The Essentials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] mb-4">
            Everything you <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">need.</span>

          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">
            Free forever. No credit card required.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-32">
          {FREE_FEATURES.map((f, i) => (
            <motion.div 
              key={f.title} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.05 }}
              className="group p-8 rounded-[32px] border border-gray-100 bg-white hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 border-b-4 hover:border-b-[#1ed760]"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: f.bg }}>
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── PRO FEATURES BENTO ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] text-white text-xs font-bold mb-4">
            <Zap className="h-3.5 w-3.5 text-[#1ed760] fill-[#1ed760]" /> Pro Plan
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] mb-4">
            Go <span className="  bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">PRO</span> for more power.
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">
            Advanced features to grow your audience and brand.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {PRO_BENTO.map((f, i) => (
            <motion.div 
              key={f.title} 
              initial={{ opacity: 0, scale: 0.98 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.03 }}
              className={`group relative overflow-hidden rounded-[24px] border border-gray-100 ${f.bg} p-6 transition-all duration-300 hover:scale-[1.02] ${f.span}`}
            >
              <div className="relative z-10">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className={`font-bold text-sm ${f.text}`}>{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mt-16"
        >
          <Link 
            to="/upgrade" 
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold bg-[#1ed760] text-[#111827] hover:scale-105 transition-all shadow-lg shadow-green-500/20 text-lg"
          >
            Upgrade to Pro — ₹99/mo
          </Link>
          <p className="text-sm text-gray-400 mt-4">Cancel the subscription anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}