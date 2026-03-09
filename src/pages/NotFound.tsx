import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TreesIcon, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] opacity-20 bg-violet-600 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-15 bg-rose-600 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center space-y-8 max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <TreesIcon className="h-6 w-6 text-emerald-400" />
          <span className="font-black text-lg">Linkso</span>
        </div>

        {/* 404 with glitch */}
        <div className="relative select-none">
          <motion.h1
            animate={glitch ? { x: [0, -4, 4, -2, 2, 0], skewX: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.2 }}
            className="text-[140px] md:text-[200px] font-black leading-none tracking-[-0.05em] bg-gradient-to-b from-white/80 to-white/10 bg-clip-text text-transparent">
            404
          </motion.h1>
          {/* Glitch layers */}
          {glitch && (
            <>
              <div className="absolute inset-0 text-[140px] md:text-[200px] font-black leading-none tracking-[-0.05em] text-rose-500/30 translate-x-[3px] translate-y-[-2px] pointer-events-none">404</div>
              <div className="absolute inset-0 text-[140px] md:text-[200px] font-black leading-none tracking-[-0.05em] text-cyan-500/30 translate-x-[-3px] translate-y-[2px] pointer-events-none">404</div>
            </>
          )}
          {/* Scan line */}
          <motion.div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{ top: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black">Page not found.</h2>
          <p className="text-white/40 leading-relaxed">
            The page <code className="text-white/60 bg-white/5 px-2 py-0.5 rounded font-mono text-sm">{location.pathname}</code> doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-sm font-semibold text-white/70 hover:text-white hover:border-white/30 transition-all">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-white text-black hover:bg-white/90 transition-all hover:scale-105">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>

        {/* Floating path chips */}
        <div className="flex flex-wrap gap-2 justify-center pt-4">
          {["/dashboard", "/signup", "/upgrade", "/blog"].map(path => (
            <Link key={path} to={path}
              className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all font-mono">
              {path}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;