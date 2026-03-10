import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  TreesIcon, LinkIcon, Palette, BarChart3, Settings, ExternalLink, Copy,
  Plus, GripVertical, Trash2, LogOut, Camera, Zap, Calendar, Star,
  QrCode, Type, Sparkles, Layout, Shield, Eye, EyeOff, Globe, Upload,
  Lock, CheckCircle2, ChevronRight, Image as ImageIcon, X, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/PlatformIcon";
import { detectPlatform } from "@/utils/detectPlatform";
import type { UserProfile, UserLink } from "@/types";

type Tab = "links" | "appearance" | "pro" | "analytics" | "settings";

const FREE_LINK_LIMIT = 3;
const FREE_THEMES = ["light", "dark"];

const FONTS = [
  { value: "default",  label: "Default",  preview: "Aa" },
  { value: "serif",    label: "Serif",    preview: "Aa", style: { fontFamily: "Georgia, serif" } },
  { value: "mono",     label: "Mono",     preview: "Aa", style: { fontFamily: "monospace" } },
  { value: "rounded",  label: "Rounded",  preview: "Aa" },
  { value: "elegant",  label: "Elegant",  preview: "Aa", style: { fontFamily: "Georgia, serif", fontStyle: "italic" } },
  { value: "bold",     label: "Bold",     preview: "Aa", style: { fontWeight: 800 } },
];

const ANIMATED_BGS = [
  { value: "none",           label: "None",           emoji: "◻️" },
  { value: "gradient-shift", label: "Gradient Shift", emoji: "🌈" },
  { value: "particles",      label: "Floating Dots",  emoji: "✨" },
  { value: "waves",          label: "Waves",          emoji: "🌊" },
  { value: "aurora",         label: "Aurora",         emoji: "🌌" },
  { value: "confetti",       label: "Confetti",       emoji: "🎊" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ url, name, size = "sm" }: { url?: string | null; name?: string | null; size?: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";
  useEffect(() => { setFailed(false); }, [url]);
  if (url && !failed) return <img src={url} alt="Avatar" className={`${dim} rounded-full object-cover`} onError={() => setFailed(true)} />;
  return <div className={`${dim} rounded-full bg-primary/20 flex items-center justify-center font-bold`}>{name?.[0]?.toUpperCase() || "?"}</div>;
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-primary/20 text-amber-500 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
      <Zap className="h-3 w-3" />PRO
    </span>
  );
}

function FreeLock({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer group" onClick={onClick}
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}>
      <Lock className="h-5 w-5 text-amber-400" />
      <p className="text-xs font-semibold text-white">{label}</p>
      <span className="text-xs text-amber-400 group-hover:underline flex items-center gap-1">Upgrade <ChevronRight className="h-3 w-3" /></span>
    </div>
  );
}

function QRCodeDisplay({ value }: { value: string }) {
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&margin=10`}
    alt="QR" className="rounded-2xl border border-border shadow-sm" width={180} height={180} />;
}

function ProfilePreview({ profile, links }: { profile: UserProfile | null; links: UserLink[] }) {
  const rawProfile = profile as any;
  const isDark = ["dark", "gradient"].includes(profile?.theme || "") || (profile?.bg_color && parseInt(profile.bg_color.replace("#", ""), 16) < 0x808080);
  const textColor = isDark ? "#fff" : "#1a1a1a";
  const btnBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)";
  const btnRadius = profile?.button_style === "pill" ? "9999px" : profile?.button_style === "sharp" ? "4px" : "14px";
  const bgStyle: React.CSSProperties = rawProfile?.bg_image_url
    ? { backgroundImage: `url(${rawProfile.bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : profile?.theme === "gradient"
    ? { background: "linear-gradient(135deg, #667eea, #764ba2)" }
    : { background: profile?.bg_color || "#ffffff" };

  const greetingText = rawProfile?.greeting_text || "Hii! 👋";
  const showGreeting = rawProfile?.show_greeting !== false;

  return (
    <div className="w-[260px] rounded-[2rem] border-[6px] border-foreground/10 shadow-2xl overflow-hidden mx-auto">
      <div className="min-h-[480px] p-5 flex flex-col items-center gap-3 relative" style={{ ...bgStyle, color: textColor }}>
        {rawProfile?.bg_image_url && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />}
        <div className="relative z-10 flex flex-col items-center gap-3 w-full">
          {/* Avatar with greeting bubble preview */}
          <div className="relative mt-2">
            {showGreeting && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full shadow-md z-20"
                style={{
                  background: isDark ? "rgba(255,255,255,0.95)" : "#1a1a1a",
                  color: isDark ? "#1a1a1a" : "#fff",
                }}>
                {greetingText}
                <span style={{
                  position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderTop: `7px solid ${isDark ? "rgba(255,255,255,0.95)" : "#1a1a1a"}`,
                }} />
              </div>
            )}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)" }}>{profile?.display_name?.[0]?.toUpperCase() || "?"}</div>}
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm">{profile?.display_name || "Your Name"}</p>
            {profile?.bio && <p className="text-xs mt-0.5 opacity-70 leading-snug">{profile.bio}</p>}
          </div>
          <div className="w-full space-y-2">
            {links.slice(0, 4).map(l => (
              <div key={l.id} className="w-full p-2.5 text-xs font-medium flex items-center gap-2 justify-center"
                style={{ borderRadius: btnRadius, background: btnBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}` }}>
                <PlatformIcon platform={l.platform} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{l.title}</span>
              </div>
            ))}
          </div>
          {!(rawProfile?.hide_branding) && (
            <div className="flex items-center gap-1 mt-2" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
              <TreesIcon className="h-3 w-3" /><span className="text-xs">Linkso</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Link Row — local state, saves to DB on blur only (fixes revert bug) ──────
function LinkRow({
  link,
  isPro,
  onUpdate,
  onDelete,
}: {
  link: UserLink;
  isPro: boolean;
  onUpdate: (id: string, updates: Partial<UserLink>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl]     = useState(link.url);
  const [isFocused, setIsFocused] = useState<"title" | "url" | null>(null);

  useEffect(() => {
    if (isFocused !== "title") setTitle(link.title);
  }, [link.title]);

  useEffect(() => {
    if (isFocused !== "url") setUrl(link.url);
  }, [link.url]);

  const handleTitleBlur = () => {
    setIsFocused(null);
    if (title !== link.title) onUpdate(link.id, { title });
  };

  const handleUrlBlur = () => {
    setIsFocused(null);
    const platform = detectPlatform(url);
    if (url !== link.url) onUpdate(link.id, { url, platform });
  };

  // Re-detect on every keystroke so the badge icon updates live
  const detectedPlatform = detectPlatform(url);

  return (
    <div className={`group bg-card rounded-2xl border transition-all ${
      (link as any).is_priority
        ? "border-primary/40 shadow-md shadow-primary/5"
        : "border-border hover:border-border/80 hover:shadow-sm"
    }`}>
      <div className="flex items-center gap-3 p-3">
        <GripVertical className="h-5 w-5 text-muted-foreground/30 cursor-grab shrink-0 hover:text-muted-foreground/60 transition-colors" />
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 transition-all">
          <PlatformIcon platform={detectedPlatform} className="text-primary h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            value={title}
            placeholder="Link title"
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setIsFocused("title")}
            onBlur={handleTitleBlur}
            className="w-full h-8 px-3 text-sm font-medium rounded-lg bg-secondary/40 border border-transparent focus:border-primary/50 focus:bg-secondary/60 outline-none text-foreground placeholder:text-muted-foreground/50 transition-all"
          />
          <input
            value={url}
            placeholder="https://..."
            onChange={e => setUrl(e.target.value)}
            onFocus={() => setIsFocused("url")}
            onBlur={handleUrlBlur}
            className="w-full h-8 px-3 text-xs rounded-lg bg-secondary/40 border border-transparent focus:border-primary/50 focus:bg-secondary/60 outline-none font-mono text-muted-foreground placeholder:text-muted-foreground/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={link.is_active}
            onCheckedChange={c => onUpdate(link.id, { is_active: c })}
          />
          <button
            onClick={() => onDelete(link.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {url && (
        <div className="px-4 pb-3 -mt-1 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${link.is_active ? "bg-green-400" : "bg-muted-foreground/30"}`} />
            <span className="text-[11px] text-muted-foreground/60 truncate font-mono">{url}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground/40 hover:text-primary flex items-center gap-0.5 shrink-0 transition-colors"
            onClick={e => e.stopPropagation()}>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}

      {isPro && (
        <div className="px-4 pb-3 pt-1 border-t border-border/40 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input type="checkbox" checked={(link as any).is_priority || false}
              onChange={e => onUpdate(link.id, { is_priority: e.target.checked } as any)}
              className="rounded accent-primary" />
            <Star className="h-3 w-3 text-amber-500" /> Priority
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input type="checkbox" checked={(link as any).is_social_icon || false}
              onChange={e => onUpdate(link.id, { is_social_icon: e.target.checked } as any)}
              className="rounded accent-primary" />
            <Layout className="h-3 w-3 text-primary" /> Social icon
          </label>
          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Show from
              </p>
              <Input type="datetime-local" defaultValue={(link as any).scheduled_start || ""}
                onChange={e => onUpdate(link.id, { scheduled_start: e.target.value } as any)}
                className="h-7 text-xs bg-secondary/40 border-transparent" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Hide after
              </p>
              <Input type="datetime-local" defaultValue={(link as any).scheduled_end || ""}
                onChange={e => onUpdate(link.id, { scheduled_end: e.target.value } as any)}
                className="h-7 text-xs bg-secondary/40 border-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [loading, setLoading] = useState(true);
  const [analyticsViews, setAnalyticsViews] = useState(0);
  const [analyticsClicks, setAnalyticsClicks] = useState<Record<string, number>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [bgUploading, setBgUploading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  // Local state for greeting text input (so it doesn't debounce while typing)
  const [greetingTextInput, setGreetingTextInput] = useState("");
  const navigate = useNavigate();

  const isPro = !!(profile?.is_pro && profile?.pro_expires_at && new Date(profile.pro_expires_at) > new Date());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!session) navigate("/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      loadData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = async (uid: string) => {
    const [pRes, lRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("links").select("*").eq("user_id", uid).order("position"),
    ]);
    if (!pRes.data) { navigate("/onboarding"); return; }
    if (pRes.data.is_onboarded === false) { navigate("/onboarding"); return; }
    setProfile(pRes.data as UserProfile);
    setGreetingTextInput((pRes.data as any).greeting_text || "");
    if (lRes.data) setLinks(lRes.data as UserLink[]);
    setLoading(false);
  };

  // ── Link ops ────────────────────────────────────────────────────────────────
  const addLink = async () => {
    if (!isPro && links.length >= FREE_LINK_LIMIT) {
      toast.error(`Free plan is limited to ${FREE_LINK_LIMIT} links.`);
      navigate("/upgrade"); return;
    }
    const { data, error } = await supabase.from("links").insert({
      user_id: user.id, title: "New Link", url: "", platform: "other", is_active: true, position: links.length,
    }).select().single();
    if (error) { toast.error("Failed"); return; }
    setLinks(prev => [...prev, data as UserLink]);
    toast.success("Link added!");
  };

  const updateLink = useCallback(async (id: string, updates: Partial<UserLink>) => {
    await supabase.from("links").update(updates).eq("id", id);
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLink = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    setLinks(prev => prev.filter(l => l.id !== id));
    toast.success("Deleted");
  };

  // ── Profile ops ─────────────────────────────────────────────────────────────
  const profDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!user) return;
    setProfile(p => p ? { ...p, ...updates } : p);
    if (profDebRef.current) clearTimeout(profDebRef.current);
    profDebRef.current = setTimeout(async () => {
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) toast.error("Failed to save");
    }, 400);
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const filePath = `${user.id}/avatar.${file.name.split(".").pop() || "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true, contentType: file.type });
    if (error) { toast.error("Upload failed"); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setProfile(p => p ? { ...p, avatar_url: url } : p);
    toast.success("Photo updated!");
    e.target.value = "";
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setBgUploading(true);
    const filePath = `${user.id}/bg.${file.name.split(".").pop() || "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true, contentType: file.type });
    if (error) { toast.error("Upload failed"); setBgUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ bg_image_url: url, theme: "custom", bg_color: null } as any).eq("id", user.id);
    setProfile(p => p ? { ...p, bg_image_url: url, theme: "custom" } as any : p);
    toast.success("Background updated!");
    setBgUploading(false);
    e.target.value = "";
  };

  // ── Analytics ───────────────────────────────────────────────────────────────
  const loadAnalytics = useCallback(async (uid: string) => {
    const [vRes, cRes] = await Promise.all([
      supabase.from("analytics_views").select("*", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("analytics_clicks").select("link_id").eq("user_id", uid),
    ]);
    if (vRes.count != null) setAnalyticsViews(vRes.count);
    if (cRes.data) {
      const counts: Record<string, number> = {};
      cRes.data.forEach((c: any) => { counts[c.link_id] = (counts[c.link_id] || 0) + 1; });
      setAnalyticsClicks(counts);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "analytics" && user?.id) loadAnalytics(user.id);
  }, [activeTab, user?.id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const profileUrl = `${window.location.origin}/${profile?.username}`;
  const totalClicks = Object.values(analyticsClicks).reduce((a, b) => a + b, 0);
  const sortedByClicks = [...links].sort((a, b) => (analyticsClicks[b.id] || 0) - (analyticsClicks[a.id] || 0));
  const sortedLinks = [...links].sort((a, b) => ((b as any).is_priority ? 1 : 0) - ((a as any).is_priority ? 1 : 0));

  const navItems: { tab: Tab; icon: any; label: string; proOnly?: boolean }[] = [
    { tab: "links",      icon: LinkIcon,  label: "Links" },
    { tab: "appearance", icon: Palette,   label: "Appearance" },
    { tab: "pro",        icon: Zap,       label: "Pro Features", proOnly: true },
    { tab: "analytics",  icon: BarChart3, label: "Analytics" },
    { tab: "settings",   icon: Settings,  label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">

      {/* ══════════════════════ SIDEBAR ══════════════════════ */}
      <aside className="hidden md:flex w-64 border-r border-border bg-secondary/10 flex-col p-4 gap-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <TreesIcon className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-lg">Linkso</span>
        </div>

        {profile && (
          <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
            <Avatar url={profile.avatar_url} name={profile.display_name} size="sm" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold truncate">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
              {isPro ? <ProBadge /> : <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Free</span>}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {navItems.map(({ tab, icon: Icon, label, proOnly }) => {
            const active = activeTab === tab;
            const locked = proOnly && !isPro;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
                  ${locked ? "opacity-60" : ""}`}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {locked && <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                {proOnly && isPro && <span className="text-xs text-amber-500 font-bold">✦</span>}
              </button>
            );
          })}
        </nav>

        {!isPro && (
          <button onClick={() => navigate("/upgrade")}
            className="w-full p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-primary/10 text-left hover:from-amber-500/15 hover:to-primary/15 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-500">Go Pro</span>
            </div>
            <p className="text-xs text-muted-foreground">Unlock all features for ₹99/mo</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-500 font-semibold group-hover:gap-2 transition-all">Upgrade now <ChevronRight className="h-3 w-3" /></div>
          </button>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <Button variant="hero-outline" size="sm" className="w-full" asChild>
            <Link to={`/${profile?.username}`} target="_blank"><ExternalLink className="h-3.5 w-3.5 mr-2" />View Profile</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
            <LogOut className="h-3.5 w-3.5 mr-2" />Log out
          </Button>
        </div>
      </aside>

      {/* ══════════════════════ MOBILE HEADER ══════════════════════ */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <TreesIcon className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold">Linkso</span>
        </div>
        <button
          onClick={() => setShowMobilePreview(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1.5"
        >
          <Eye className="h-3.5 w-3.5" />Preview
        </button>
      </div>

      {/* ══════════════════════ MOBILE PREVIEW MODAL ══════════════════════ */}
      {showMobilePreview && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6">
          <button
            onClick={() => setShowMobilePreview(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-muted-foreground mb-5">Live Preview</p>
          <ProfilePreview profile={profile} links={sortedLinks} />
          <div className="mt-5 flex gap-3">
            <Button variant="hero-outline" size="sm" asChild>
              <Link to={`/${profile?.username}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" />Open Profile</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success("Copied!"); }}>
              <Copy className="h-4 w-4 mr-2" />Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════ MOBILE BOTTOM NAV ══════════════════════ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border flex justify-around py-2 px-2">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs rounded-lg ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">

          {/* ─── LINKS TAB ─────────────────────────────────────── */}
          {activeTab === "links" && (
            <div className="grid md:grid-cols-[1fr_280px] gap-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-heading font-bold">Links</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isPro ? `${links.length} links · Unlimited` : `${links.length}/${FREE_LINK_LIMIT} links`}
                      {!isPro && <button onClick={() => navigate("/upgrade")} className="ml-1.5 text-primary hover:underline">Upgrade for more</button>}
                    </p>
                  </div>
                  <Button variant="hero" size="sm" onClick={addLink} disabled={!isPro && links.length >= FREE_LINK_LIMIT}>
                    <Plus className="h-4 w-4 mr-2" />Add Link
                  </Button>
                </div>

                <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 p-4 flex items-center gap-3">
                  <div className="flex-1 font-mono text-sm truncate text-muted-foreground">{profileUrl}</div>
                  <Button size="sm" variant="hero" onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success("Copied!"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />Copy
                  </Button>
                </div>

                <div className="space-y-3">
                  {sortedLinks.map(link => (
                    <LinkRow
                      key={link.id}
                      link={link}
                      isPro={isPro}
                      onUpdate={updateLink}
                      onDelete={deleteLink}
                    />
                  ))}

                  {links.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                      <LinkIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold">No links yet</p>
                      <p className="text-sm mt-1">Click "Add Link" to start</p>
                    </div>
                  )}

                  {!isPro && links.length >= FREE_LINK_LIMIT && (
                    <div className="rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-3">
                      <Zap className="h-7 w-7 text-amber-500 mx-auto" />
                      <p className="font-semibold text-sm">Free limit reached ({FREE_LINK_LIMIT} links)</p>
                      <Button variant="hero" size="sm" onClick={() => navigate("/upgrade")}>Upgrade to Pro · ₹99/mo</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="sticky top-8 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground text-center">Live Preview</p>
                  <ProfilePreview profile={profile} links={sortedLinks} />
                  <Button variant="hero-outline" size="sm" className="w-full" asChild>
                    <Link to={`/${profile?.username}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" />Open Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── APPEARANCE TAB ────────────────────────────────── */}
          {activeTab === "appearance" && (
            <div className="grid md:grid-cols-[1fr_280px] gap-8">
              <div className="space-y-6">
                <h1 className="text-2xl font-heading font-bold">Appearance</h1>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Profile Photo</h2>
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <Avatar url={profile?.avatar_url} name={profile?.display_name} size="lg" />
                      <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="h-5 w-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload a photo</p>
                      <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, max 2MB</p>
                      {profile?.avatar_url && <p className="text-xs text-primary mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>}
                    </div>
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Profile Info</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                      <Input value={profile?.display_name || ""} onChange={e => debProfile({ display_name: e.target.value })} className="bg-secondary/40 border-transparent focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Bio <span className="text-muted-foreground font-normal">({(profile?.bio || "").length}/80)</span></label>
                      <Input value={profile?.bio || ""} maxLength={80} onChange={e => debProfile({ bio: e.target.value })} placeholder="A short bio…" className="bg-secondary/40 border-transparent focus:border-primary" />
                    </div>
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Theme & Colors</h2>
                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light",    label: "Light",    bg: "#FFFFFF",                                fg: "#1a1a1a" },
                        { value: "dark",     label: "Dark",     bg: "#0F172A",                                fg: "#ffffff" },
                        { value: "gradient", label: "Gradient", bg: "linear-gradient(135deg,#667eea,#764ba2)", fg: "#ffffff", pro: true },
                      ].map(t => (
                        <div key={t.value} className="relative">
                          <button onClick={async () => {
                            if ((t as any).pro && !isPro) { navigate("/upgrade"); return; }
                            setProfile(p => p ? { ...p, theme: t.value } : p);
                            await supabase.from("profiles").update({ theme: t.value }).eq("id", user.id);
                          }}
                            className={`w-full p-4 rounded-xl border-2 text-sm font-medium transition-all ${profile?.theme === t.value ? "border-primary scale-105 shadow-md" : "border-border hover:border-primary/50"}`}
                            style={{ background: t.bg, color: t.fg }}>
                            {t.label}
                          </button>
                          {(t as any).pro && !isPro && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                              <Lock className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Background Color</label>
                    <div className="flex flex-wrap gap-3">
                      {["#FFFFFF","#F8FAFC","#F0FDF4","#F0F9FF","#FFF7ED","#1A1A2E","#0F172A","#18181B"].map(c => (
                        <button key={c} onClick={async () => { setProfile(p => p ? { ...p, bg_color: c } : p); await supabase.from("profiles").update({ bg_color: c }).eq("id", user.id); }}
                          className={`w-10 h-10 rounded-xl border-2 transition-all ${profile?.bg_color === c ? "border-primary scale-110 shadow-md" : "border-border hover:scale-105"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                      <label className="w-10 h-10 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <input type="color" value={profile?.bg_color || "#FFFFFF"} className="hidden" onChange={async e => { const v = e.target.value; setProfile(p => p ? { ...p, bg_color: v } : p); await supabase.from("profiles").update({ bg_color: v }).eq("id", user.id); }} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Button Style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ value: "rounded", label: "Rounded" }, { value: "pill", label: "Pill" }, { value: "sharp", label: "Sharp" }].map(s => (
                        <button key={s.value} onClick={async () => { setProfile(p => p ? { ...p, button_style: s.value } : p); await supabase.from("profiles").update({ button_style: s.value }).eq("id", user.id); }}
                          className={`py-3 border-2 rounded-xl text-sm font-medium transition-all ${profile?.button_style === s.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />Background Image
                    </h2>
                    <ProBadge />
                  </div>
                  {!isPro && <FreeLock label="Background Image" onClick={() => navigate("/upgrade")} />}
                  <p className="text-sm text-muted-foreground">Upload a custom image as your profile background.</p>
                  {(profile as any)?.bg_image_url && (
                    <div className="relative rounded-xl overflow-hidden h-28 border border-border">
                      <img src={(profile as any).bg_image_url} alt="bg" className="w-full h-full object-cover" />
                      <button onClick={async () => { await supabase.from("profiles").update({ bg_image_url: null } as any).eq("id", user.id); setProfile(p => p ? { ...p, bg_image_url: null } as any : p); toast.success("Removed"); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">×</button>
                    </div>
                  )}
                  <label className={`flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors ${bgUploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bgUploading ? "Uploading…" : "Upload image"}</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG · Max 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} disabled={!isPro} />
                  </label>
                </section>

                {!isPro && (
                  <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex items-start gap-4">
                    <TreesIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Powered by Linkso branding</p>
                      <p className="text-xs text-muted-foreground mt-1">Your profile shows "Made with Linkso". <button onClick={() => navigate("/upgrade")} className="text-primary hover:underline">Upgrade to remove it.</button></p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block">
                <div className="sticky top-8 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground text-center">Live Preview</p>
                  <ProfilePreview profile={profile} links={links} />
                </div>
              </div>
            </div>
          )}

          {/* ─── PRO FEATURES TAB ──────────────────────────────── */}
          {activeTab === "pro" && (
            <div className="grid md:grid-cols-[1fr_280px] gap-8">
              <div className="space-y-6">
                <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-primary/5 to-purple-500/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h1 className="text-xl font-heading font-bold flex items-center gap-2">Pro Features <ProBadge /></h1>
                      {isPro
                        ? <p className="text-sm text-muted-foreground">Active until {new Date(profile!.pro_expires_at!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                        : <p className="text-sm text-muted-foreground">Unlock all features for <button onClick={() => navigate("/upgrade")} className="text-primary font-semibold hover:underline">₹99/mo</button></p>}
                    </div>
                  </div>
                  {!isPro && <Button variant="hero" onClick={() => navigate("/upgrade")} className="w-full md:w-auto"><Zap className="h-4 w-4 mr-2" />Upgrade to Pro · ₹99/month</Button>}
                </div>

                <section className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
                  {!isPro && <FreeLock label="Verified Badge" onClick={() => navigate("/upgrade")} />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" />Verified Badge</h2>
                      <p className="text-sm text-muted-foreground">Show a ✦ star badge next to your name on your public profile.</p>
                    </div>
                    <Switch checked={(profile as any)?.is_verified || false} onCheckedChange={c => debProfile({ is_verified: c } as any)} disabled={!isPro} />
                  </div>
                </section>

                {/* ── GREETING BUBBLE (NEW PRO FEATURE) ── */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-5 relative overflow-hidden">
                  {!isPro && <FreeLock label="Custom Greeting Bubble" onClick={() => navigate("/upgrade")} />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Greeting Bubble
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Show an animated speech bubble when visitors open your profile.
                      </p>
                    </div>
                    <Switch
                      checked={(profile as any)?.show_greeting !== false}
                      onCheckedChange={c => debProfile({ show_greeting: c } as any)}
                      disabled={!isPro}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Bubble Text <span className="text-muted-foreground font-normal">({greetingTextInput.length}/40)</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={greetingTextInput}
                          onChange={e => setGreetingTextInput(e.target.value)}
                          placeholder="Hii! 👋"
                          maxLength={40}
                          className="bg-secondary/40 border-transparent focus:border-primary flex-1"
                          disabled={!isPro}
                        />
                        <Button
                          variant="hero"
                          size="sm"
                          disabled={!isPro}
                          onClick={async () => {
                            const text = greetingTextInput.trim() || "Hii! 👋";
                            await supabase.from("profiles").update({ greeting_text: text } as any).eq("id", user.id);
                            setProfile(p => p ? { ...p, greeting_text: text } as any : p);
                            toast.success("Greeting saved!");
                          }}
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Supports emojis · defaults to "Hii! 👋" when left empty
                      </p>
                    </div>

                    {/* Preset quick-picks */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Quick picks:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Hii! 👋", "Welcome! 🎉", "Hey there! 😊", "Sup! 🤙", "Hello! 🌟", "Aloha! 🌺"].map(preset => (
                          <button
                            key={preset}
                            disabled={!isPro}
                            onClick={() => setGreetingTextInput(preset)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              greetingTextInput === preset
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live mini-preview of bubble */}
                  {isPro && (
                    <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-4">
                      <div className="text-xs text-muted-foreground shrink-0">Preview:</div>
                      <div className="relative">
                        <div
                          className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-md"
                          style={{ background: "#1a1a1a", color: "#fff" }}
                        >
                          {greetingTextInput || "Hii! 👋"}
                        </div>
                        <span style={{
                          position: "absolute", bottom: "-7px", left: "50%", transform: "translateX(-50%)",
                          width: 0, height: 0,
                          borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                          borderTop: "7px solid #1a1a1a",
                        }} />
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {(profile as any)?.show_greeting !== false ? (
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="h-3 w-3" /> Visible to visitors</span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground"><EyeOff className="h-3 w-3" /> Hidden</span>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
                  {!isPro && <FreeLock label="Remove Branding" onClick={() => navigate("/upgrade")} />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Remove Branding</h2>
                      <p className="text-sm text-muted-foreground">Hide "Made with Linkso" from your public profile.</p>
                    </div>
                    <Switch checked={(profile as any)?.hide_branding || false} onCheckedChange={c => debProfile({ hide_branding: c } as any)} disabled={!isPro} />
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="Custom Fonts" onClick={() => navigate("/upgrade")} />}
                  <h2 className="font-semibold flex items-center gap-2"><Type className="h-4 w-4 text-primary" />Custom Font</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {FONTS.map(f => (
                      <button key={f.value} onClick={() => debProfile({ custom_font: f.value } as any)} disabled={!isPro}
                        className={`p-3 rounded-xl border-2 transition-all ${(profile as any)?.custom_font === f.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                        style={f.style || {}}>
                        <p className="text-lg font-bold leading-none mb-1">{f.preview}</p>
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="Animated Backgrounds" onClick={() => navigate("/upgrade")} />}
                  <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Animated Background</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ANIMATED_BGS.map(bg => (
                      <button key={bg.value} onClick={() => debProfile({ animated_bg: bg.value } as any)} disabled={!isPro}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${(profile as any)?.animated_bg === bg.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                        <span className="text-lg">{bg.emoji}</span>
                        <p className="text-xs font-medium mt-1">{bg.label}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="Password Protection" onClick={() => navigate("/upgrade")} />}
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Password Protection</h2>
                    {(profile as any)?.is_password_protected && (
                      <button onClick={async () => { await supabase.from("profiles").update({ profile_password: null, is_password_protected: false }).eq("id", user.id); setProfile(p => p ? { ...p, is_password_protected: false } as any : p); toast.success("Removed"); }}
                        className="text-xs text-destructive hover:underline">Remove</button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Require a password before visitors can view your profile.</p>
                  {(profile as any)?.is_password_protected && <p className="text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> Password protection is active</p>}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Set a password…" className="pr-10 bg-secondary/40 border-transparent focus:border-primary" disabled={!isPro} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button variant="hero" size="sm" disabled={!isPro} onClick={async () => {
                      if (newPassword.length < 4) { toast.error("Min 4 characters"); return; }
                      await supabase.from("profiles").update({ profile_password: newPassword, is_password_protected: true }).eq("id", user.id);
                      setProfile(p => p ? { ...p, is_password_protected: true } as any : p);
                      toast.success("Password set!"); setNewPassword("");
                    }}>Save</Button>
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="QR Code" onClick={() => navigate("/upgrade")} />}
                  <h2 className="font-semibold flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" />Profile QR Code</h2>
                  <p className="text-sm text-muted-foreground">Download and share your QR code anywhere.</p>
                  <div className="flex flex-col items-center gap-4 py-2">
                    <QRCodeDisplay value={profileUrl} />
                    <Button variant="hero-outline" size="sm" onClick={() => { const a = document.createElement("a"); a.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(profileUrl)}&margin=20`; a.download = "my-qr.png"; a.click(); }} disabled={!isPro}>
                      <QrCode className="h-4 w-4 mr-2" />Download QR Code
                    </Button>
                  </div>
                </section>

                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="Custom Domain" onClick={() => navigate("/upgrade")} />}
                  <h2 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Custom Domain</h2>
                  <p className="text-sm text-muted-foreground">Point your own domain to your Linkso profile.</p>
                  <div className="flex gap-2">
                    <Input value={(profile as any)?.custom_domain || ""} onChange={e => setProfile(p => p ? { ...p, custom_domain: e.target.value } as any : p)} placeholder="links.yourname.com" className="flex-1 bg-secondary/40 border-transparent focus:border-primary" disabled={!isPro} />
                    <Button variant="hero" size="sm" disabled={!isPro} onClick={async () => {
                      const domain = (profile as any)?.custom_domain?.trim();
                      if (!domain) { toast.error("Enter a domain"); return; }
                      await supabase.from("profiles").update({ custom_domain: domain }).eq("id", user.id);
                      toast.success("Domain saved!");
                    }}>Save</Button>
                  </div>
                  {(profile as any)?.custom_domain && isPro && (
                    <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold">Add this CNAME to your DNS settings:</p>
                      <div className="font-mono text-xs bg-background rounded-lg p-3 space-y-1 border border-border">
                        <div className="flex gap-2"><span className="text-primary w-16 shrink-0">Type</span><span>CNAME</span></div>
                        <div className="flex gap-2"><span className="text-primary w-16 shrink-0">Name</span><span>{(profile as any).custom_domain.split(".")[0]}</span></div>
                        <div className="flex gap-2"><span className="text-primary w-16 shrink-0">Value</span><span>cname.linktree.app</span></div>
                        <div className="flex gap-2"><span className="text-primary w-16 shrink-0">TTL</span><span>Auto</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground">⏱ DNS changes take up to 48 hours to propagate.</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="hidden md:block">
                <div className="sticky top-8 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground text-center">Live Preview</p>
                  <ProfilePreview profile={profile} links={links} />
                </div>
              </div>
            </div>
          )}

          {/* ─── ANALYTICS TAB ─────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-2xl font-heading font-bold">Analytics</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-4xl font-heading font-bold text-primary mt-2">{analyticsViews}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-4xl font-heading font-bold text-primary mt-2">{totalClicks}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-5 relative overflow-hidden">
                {!isPro && <FreeLock label="Advanced Analytics" onClick={() => navigate("/upgrade")} />}
                <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Advanced Analytics <ProBadge /></h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">CTR</p>
                    <p className="text-2xl font-bold text-primary mt-1">{analyticsViews > 0 ? ((totalClicks / analyticsViews) * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Top Link</p>
                    <p className="text-sm font-bold text-primary mt-1 truncate">{sortedByClicks[0]?.title || "—"}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Avg/View</p>
                    <p className="text-2xl font-bold text-primary mt-1">{analyticsViews > 0 ? (totalClicks / analyticsViews).toFixed(2) : 0}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sortedByClicks.map(l => {
                    const c = analyticsClicks[l.id] || 0;
                    const pct = totalClicks > 0 ? (c / totalClicks) * 100 : 0;
                    return (
                      <div key={l.id}>
                        <div className="flex justify-between text-sm mb-1"><span className="truncate font-medium">{l.title}</span><span className="text-primary font-semibold ml-2">{c}</span></div>
                        <div className="h-1.5 bg-secondary rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ──────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-2xl font-heading font-bold">Settings</h1>

              <section className={`rounded-2xl p-6 border ${isPro ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold flex items-center gap-2">{isPro ? <><ProBadge /> Pro Plan</> : "Free Plan"}</h2>
                    {isPro
                      ? <p className="text-sm text-muted-foreground mt-1">Renews {new Date(profile!.pro_expires_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      : <p className="text-sm text-muted-foreground mt-1">Limited to {FREE_LINK_LIMIT} links · basic themes · Linkso branding</p>}
                  </div>
                  {!isPro && <Button variant="hero" size="sm" onClick={() => navigate("/upgrade")}><Zap className="h-4 w-4 mr-1.5" />Upgrade</Button>}
                </div>
              </section>

              <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold">Account</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="mt-1 text-sm bg-secondary/40 px-3 py-2 rounded-lg">{user?.email}</p>
                </div>
              </section>

              <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold">Change Username</h2>
                <p className="text-sm text-muted-foreground">Current: <span className="font-mono font-medium text-foreground">@{profile?.username}</span></p>
                <Input id="new-un" placeholder="newusername" className="bg-secondary/40 border-transparent focus:border-primary" onChange={e => { e.target.value = e.target.value.replace(/[^a-z0-9_]/g, ""); }} />
                <Button variant="hero" size="sm" onClick={async () => {
                  const v = (document.getElementById("new-un") as HTMLInputElement).value.trim();
                  if (v.length < 3) { toast.error("Min 3 characters"); return; }
                  if (v === profile?.username) { toast.error("Same as current"); return; }
                  const { data: ex } = await supabase.from("profiles").select("id").eq("username", v).maybeSingle();
                  if (ex) { toast.error("Username taken"); return; }
                  await supabase.from("profiles").update({ username: v }).eq("id", user.id);
                  setProfile(p => p ? { ...p, username: v } : p);
                  toast.success("Username updated!");
                  (document.getElementById("new-un") as HTMLInputElement).value = "";
                }}>Update Username</Button>
              </section>

              <section className="bg-card rounded-2xl border border-destructive/25 p-6 space-y-3">
                <h2 className="font-semibold text-destructive">Danger Zone</h2>
                <Button variant="destructive" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" />Log out
                </Button>
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}