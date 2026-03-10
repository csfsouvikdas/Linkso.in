import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
// Updated import to ensure Platform type and labels match your utility file
import { platformLabels, type Platform } from "@/utils/detectPlatform";
import { motion, AnimatePresence } from "framer-motion";
import { TreesIcon, Star, Eye, EyeOff, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdPlaceholder } from "@/components/AdBanner";
import type { UserLink } from "@/types";

const FONT_MAP: Record<string, string> = {
  default: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  rounded: "font-heading",
  elegant: "font-serif italic",
  bold: "font-bold tracking-tight",
};

function ProfileAdBanner({ isPro }: { isPro: boolean }) {
  if (isPro) return null;
  return (
    <div className="w-full mt-2">
      <AdPlaceholder isPro={false} label="Ad · Remove with Pro" />
    </div>
  );
}

function AnimatedBg({ type, isDark }: { type: string; isDark: boolean }) {
  if (!type || type === "none") return null;
  const base = isDark ? "255,255,255" : "0,0,0";
  if (type === "particles") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute rounded-full animate-pulse" style={{ width: `${Math.random()*8+3}px`, height: `${Math.random()*8+3}px`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: `rgba(${base},${Math.random()*0.12+0.04})`, animationDuration: `${Math.random()*3+2}s`, animationDelay: `${Math.random()*2}s` }} />
      ))}
    </div>
  );
  if (type === "aurora") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", animation: "pulse 6s ease-in-out infinite" }} />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)", animation: "pulse 8s ease-in-out infinite reverse" }} />
    </div>
  );
  if (type === "gradient-shift") return (
    <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "linear-gradient(270deg,#667eea22,#764ba222,#f093fb22)", backgroundSize: "400% 400%", animation: "gradientShift 8s ease infinite" }} />
  );
  if (type === "waves") return (
    <div className="absolute inset-0 pointer-events-none z-10" style={{ background: `radial-gradient(ellipse at 20% 50%,rgba(${base},0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 50%,rgba(${base},0.07) 0%,transparent 50%)`, animation: "pulse 4s ease-in-out infinite" }} />
  );
  if (type === "confetti") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} className="absolute animate-bounce" style={{ width: "7px", height: "7px", left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: ["#667eea","#f093fb","#f5576c","#22c55e","#fbbf24"][i%5], borderRadius: Math.random()>0.5?"50%":"2px", opacity: 0.35, animationDuration: `${Math.random()*2+1}s`, animationDelay: `${Math.random()*2}s` }} />
      ))}
    </div>
  );
  return null;
}

function GreetingBubble({
  isDark,
  show,
  text = "Hii! 👋",
}: {
  isDark: boolean;
  show: boolean;
  text?: string;
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!show) { setTyped(""); return; }
    let i = 0;
    setTyped("");
    const iv = setInterval(() => {
      setTyped(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, [show, text]);

  const bubbleBg = isDark ? "rgba(255,255,255,0.95)" : "#1a1a1a";
  const bubbleColor = isDark ? "#1a1a1a" : "#fff";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            position: "absolute",
            top: "-54px",
            left: "50%",
            transform: "translateX(-50%)",
            background: bubbleBg,
            color: bubbleColor,
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            zIndex: 50,
            letterSpacing: "0.01em",
          }}
        >
          {typed}
          <span style={{
            position: "absolute",
            bottom: "-7px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: `8px solid ${bubbleBg}`,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PulseRing({ active, color }: { active: boolean; color: string }) {
  return (
    <span style={{
      position: "absolute",
      inset: "-4px",
      borderRadius: "50%",
      border: `2px solid ${color}`,
      animation: active ? "avatarPulse 2s ease-out 0.1s infinite" : "none",
      pointerEvents: "none",
      zIndex: 1,
    }} />
  );
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [avatarPopped, setAvatarPopped] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => { if (username) loadProfile(); }, [username]);

  useEffect(() => {
    if (!profile || loading) return;

    // Logic: Free users always show greeting. Pro users respect the toggle.
    const isPro = !!(profile?.is_pro);
    const shouldShowGreeting = isPro ? (profile.show_greeting !== false) : true;

    const t1 = setTimeout(() => setAvatarPopped(true), 300);
    const t2 = setTimeout(() => {
      if (shouldShowGreeting) {
        setShowGreeting(true);
        setPulseActive(true);
      }
    }, 950);
    const t3 = setTimeout(() => setShowGreeting(false), 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [profile, loading]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("username", username!.toLowerCase()).maybeSingle();
    if (!data) { setNotFound(true); setLoading(false); return; }
    setProfile(data);
    if (data.is_password_protected && data.profile_password) { setPasswordRequired(true); setLoading(false); return; }
    await loadLinksAndTrack(data);
  };

  const loadLinksAndTrack = async (p: any) => {
    const { data: linksData } = await supabase.from("links").select("*").eq("user_id", p.id).eq("is_active", true).order("position");
    if (linksData) {
      const now = new Date();
      const filtered = linksData.filter((l: any) => {
        if (l.scheduled_start && new Date(l.scheduled_start) > now) return false;
        if (l.scheduled_end && new Date(l.scheduled_end) < now) return false;
        return true;
      });
      filtered.sort((a: any, b: any) => (b.is_priority ? 1 : 0) - (a.is_priority ? 1 : 0));
      setLinks(filtered as UserLink[]);
    }
    await supabase.from("analytics_views").insert({ user_id: p.id });
    setLoading(false);
  };

  const handleLinkClick = async (link: UserLink) => {
    await supabase.from("analytics_clicks").insert({ link_id: link.id, user_id: link.user_id });
    window.open(link.url, "_blank");
  };

  const handlePasswordSubmit = async () => {
    if (passwordInput === profile?.profile_password) {
      setPasswordRequired(false);
      setPasswordError(false);
      await loadLinksAndTrack(profile);
    } else setPasswordError(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4 gap-6">
      <TreesIcon className="h-12 w-12 text-primary" />
      <h1 className="text-3xl font-heading font-bold">Page not found</h1>
      <p className="text-muted-foreground">This username hasn't been claimed yet.</p>
      <Button variant="hero" asChild><Link to="/signup">Claim it now →</Link></Button>
    </div>
  );

  if (passwordRequired) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Protected Profile</h1>
          <p className="text-sm text-muted-foreground">Enter the password to view <strong>@{username}</strong></p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={e => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="Enter password"
              className={passwordError ? "border-destructive" : ""}
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && <p className="text-xs text-destructive">Incorrect password.</p>}
          <Button variant="hero" className="w-full" onClick={handlePasswordSubmit}>Unlock Profile</Button>
        </div>
      </div>
    </div>
  );

  const isPro = !!(profile?.is_pro);
  const isVerified = isPro && profile?.is_verified;
  const hideBranding = isPro && profile?.hide_branding;
  const fontClass = isPro ? (FONT_MAP[profile?.custom_font] || "font-sans") : "font-sans";
  const animatedBg = isPro ? (profile?.animated_bg || "none") : "none";
  const hasBgImage = isPro && profile?.bg_image_url;

  const greetingText = isPro ? (profile?.greeting_text || "Hii! 👋") : "Hii! 👋";
  const greetingEnabled = isPro ? profile?.show_greeting !== false : true;

  const isDark = ["dark", "gradient"].includes(profile?.theme || "")
    || (profile?.bg_color && parseInt(profile.bg_color.replace("#", ""), 16) < 0x808080)
    || hasBgImage;

  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const subColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const btnBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
  const btnBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.09)";
  const btnRadius = profile?.button_style === "pill" ? "9999px" : profile?.button_style === "sharp" ? "4px" : "16px";
  const pulseColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(102,126,234,0.5)";

  const pageBg: React.CSSProperties = hasBgImage
    ? { backgroundImage: `url(${profile.bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }
    : profile?.theme === "gradient"
    ? { background: "linear-gradient(135deg,#667eea,#764ba2)" }
    : { background: profile?.bg_color || "#ffffff" };

  const socialLinks = links.filter(l => (l as any).is_social_icon);
  const regularLinks = links.filter(l => !(l as any).is_social_icon);

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
        @keyframes avatarPulse   { 0%     { transform: scale(1);    opacity: 0.55 } 100% { transform: scale(1.7); opacity: 0 } }
      `}</style>

      <div className={`min-h-screen relative flex flex-col items-center ${fontClass}`} style={{ ...pageBg, color: textColor }}>

        {hasBgImage && <div className="absolute inset-0 bg-black/40 z-0" />}
        <AnimatedBg type={animatedBg} isDark={!!isDark} />

        {!isPro && (
          <div className="relative z-20 w-full max-w-md px-4 pt-6">
            <div style={{
              background: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}>
              <AdPlaceholder isPro={false} label="Ad · Upgrade to Pro to remove ads" />
            </div>
          </div>
        )}

        <div className="relative z-20 w-full max-w-md px-4 py-10 flex flex-col items-center gap-6">

          <div style={{ position: "relative", marginTop: "16px", paddingTop: "60px" }}>
            <div style={{ position: "absolute", inset: "60px 0 0 0", borderRadius: "50%" }}>
              <PulseRing active={pulseActive && greetingEnabled} color={pulseColor} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 90, scale: 0.65 }}
              animate={avatarPopped
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 90, scale: 0.65 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ position: "relative" }}
            >
              <GreetingBubble
                isDark={!!isDark}
                show={showGreeting && greetingEnabled}
                text={greetingText}
              />

              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)",
                  background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              >
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                      {profile?.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                }
              </div>

              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-center space-y-1.5"
          >
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
              {profile?.display_name}
              {isVerified && <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />}
            </h1>
            {profile?.bio && (
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: subColor }}>
                {profile.bio}
              </p>
            )}
          </motion.div>

          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex gap-3 flex-wrap justify-center"
            >
              {socialLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  onClick={() => handleLinkClick(link)}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ background: btnBg, border: `1px solid ${btnBorder}`, backdropFilter: "blur(8px)" }}
                  title={link.title}
                >
                  <PlatformIcon platform={link.platform} />
                </motion.button>
              ))}
            </motion.div>
          )}

          <div className="w-full space-y-3">
            {regularLinks.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-4 p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderRadius: btnRadius, background: btnBg, border: `1px solid ${btnBorder}`, backdropFilter: "blur(12px)" }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ borderRadius: btnRadius === "4px" ? "4px" : "12px", background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)" }}
                >
                  <PlatformIcon platform={link.platform} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {(link as any).is_priority && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                    <span className="font-semibold text-sm truncate">{link.title}</span>
                  </div>
                  <span className="text-xs truncate" style={{ color: subColor }}>
                    {platformLabels[link.platform as Platform] || "Link"}
                  </span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-40" />
              </motion.button>
            ))}
            {links.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: subColor }}>No links yet.</p>
            )}
          </div>

          {!isPro && links.length > 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="w-full">
              <div style={{
                background: isDark ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.60)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
                border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}>
                <AdPlaceholder isPro={false} label="Ad · Upgrade to Pro to remove" />
              </div>
            </motion.div>
          )}

          {hideBranding ? null : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="w-full mt-2">
              {!isPro ? (
                <div
                  className="w-full rounded-2xl overflow-hidden border"
                  style={{
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                    background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="px-5 py-4 flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-2">
                      <TreesIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold" style={{ color: textColor }}>Made with Linkso</span>
                    </div>
                    <p className="text-xs" style={{ color: subColor }}>Create your own free link-in-bio page</p>
                    <Link to="/signup">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
                        <TreesIcon className="h-3.5 w-3.5" />Create your Linkso — Free
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5" style={{ color: subColor }}>
                  <TreesIcon className="h-3.5 w-3.5" />
                  <Link to="/" className="text-xs hover:opacity-80 transition-opacity">Linkso</Link>
                </div>
              )}
            </motion.div>
          )}

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}