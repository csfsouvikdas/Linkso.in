import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  TreesIcon, LinkIcon, Palette, BarChart3, Settings, ExternalLink, Copy,
  Plus, GripVertical, Trash2, LogOut, Camera, Zap, Calendar, Star,
  QrCode, Type, Sparkles, Layout, Shield, Eye, EyeOff, Globe, Upload,
  Lock, CheckCircle2, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/PlatformIcon";
import { detectPlatform } from "@/utils/detectPlatform";
import type { UserProfile, UserLink } from "@/types";

type Tab = "links" | "appearance" | "pro" | "analytics" | "settings";

// Free limits
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

// Lock overlay shown on free-gated features
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

// ─── Profile Preview ──────────────────────────────────────────────────────────
function ProfilePreview({ profile, links }: { profile: UserProfile | null; links: UserLink[] }) {
  const rawProfile = profile as any;
  const isDark = ["dark", "gradient"].includes(profile?.theme || "") || (profile?.bg_color && parseInt(profile.bg_color.replace("#", ""), 16) < 0x808080);
  const textColor = isDark ? "#fff" : "#1a1a1a";
  const subColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const btnBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)";
  const btnRadius = profile?.button_style === "pill" ? "9999px" : profile?.button_style === "sharp" ? "4px" : "14px";
  const bgStyle: React.CSSProperties = rawProfile?.bg_image_url
    ? { backgroundImage: `url(${rawProfile.bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : profile?.theme === "gradient"
    ? { background: "linear-gradient(135deg, #667eea, #764ba2)" }
    : { background: profile?.bg_color || "#ffffff" };

  return (
    <div className="w-[260px] rounded-[2rem] border-[6px] border-foreground/10 shadow-2xl overflow-hidden mx-auto">
      <div className="min-h-[480px] p-5 flex flex-col items-center gap-3 relative" style={{ ...bgStyle, color: textColor }}>
        {/* bg image overlay */}
        {rawProfile?.bg_image_url && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />}
        <div className="relative z-10 flex flex-col items-center gap-3 w-full">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 mt-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)" }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)" }}>{profile?.display_name?.[0]?.toUpperCase() || "?"}</div>}
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
          {/* Branding in preview */}
          {!(rawProfile?.hide_branding) && (
            <div className="flex items-center gap-1 mt-2" style={{ color: subColor }}>
              <TreesIcon className="h-3 w-3" /><span className="text-xs">Linkso</span>
            </div>
          )}
        </div>
      </div>
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
    if (updates.url !== undefined) updates = { ...updates, platform: detectPlatform(updates.url) };
    await supabase.from("links").update(updates).eq("id", id);
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const debRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const debLink = useCallback((id: string, updates: Partial<UserLink>) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (debRef.current[id]) clearTimeout(debRef.current[id]);
    debRef.current[id] = setTimeout(() => { updateLink(id, updates); delete debRef.current[id]; }, 400);
  }, [updateLink]);

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

        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-1">
          <TreesIcon className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-lg">Linkso</span>
        </div>

        {/* Profile card */}
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

        {/* Nav */}
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

        {/* Upgrade CTA */}
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

        {/* Quick actions */}
        <div className="space-y-2 border-t border-border pt-3">
          <Button variant="hero-outline" size="sm" className="w-full" asChild>
            <Link to={`/${profile?.username}`} target="_blank"><ExternalLink className="h-3.5 w-3.5 mr-2" />View Profile</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
            <LogOut className="h-3.5 w-3.5 mr-2" />Log out
          </Button>
        </div>
      </aside>

      {/* ══════════════════════ MOBILE NAV ══════════════════════ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-t border-border flex justify-around py-2 px-2">
        {navItems.map(({ tab, icon: Icon }) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-xs rounded-lg ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto p-6 md:p-8">

          {/* ─── LINKS TAB ─────────────────────────────────────── */}
          {activeTab === "links" && (
            <div className="grid md:grid-cols-[1fr_280px] gap-8">
              <div className="space-y-5">
                {/* Header */}
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

                {/* URL card */}
                <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 p-4 flex items-center gap-3">
                  <div className="flex-1 font-mono text-sm truncate text-muted-foreground">{profileUrl}</div>
                  <Button size="sm" variant="hero" onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success("Copied!"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />Copy
                  </Button>
                </div>

                {/* Link list */}
                <div className="space-y-3">
                  {sortedLinks.map(link => (
                    <div key={link.id} className={`bg-card rounded-2xl border p-4 space-y-3 transition-all ${(link as any).is_priority ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"}`}>
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <PlatformIcon platform={link.platform} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Input value={link.title} onChange={e => debLink(link.id, { title: e.target.value })} placeholder="Link title" className="h-8 text-sm bg-secondary/40 border-transparent focus:border-primary" />
                          <Input value={link.url} onChange={e => debLink(link.id, { url: e.target.value })} placeholder="https://..." className="h-8 text-sm bg-secondary/40 border-transparent focus:border-primary font-mono" />
                        </div>
                        <Switch checked={link.is_active} onCheckedChange={c => updateLink(link.id, { is_active: c })} />
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8" onClick={() => deleteLink(link.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Pro link options */}
                      {isPro && (
                        <div className="ml-11 pt-2 border-t border-border/50 flex flex-wrap gap-5">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            <input type="checkbox" checked={(link as any).is_priority || false} onChange={e => updateLink(link.id, { is_priority: e.target.checked } as any)} className="rounded accent-primary" />
                            <Star className="h-3 w-3 text-amber-500" /> Priority
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            <input type="checkbox" checked={(link as any).is_social_icon || false} onChange={e => updateLink(link.id, { is_social_icon: e.target.checked } as any)} className="rounded accent-primary" />
                            <Layout className="h-3 w-3 text-primary" /> Social icon row
                          </label>
                          <div className="flex gap-3 w-full">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Show from</p>
                              <Input type="datetime-local" value={(link as any).scheduled_start || ""} onChange={e => debLink(link.id, { scheduled_start: e.target.value } as any)} className="h-7 text-xs bg-secondary/40 border-transparent" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Hide after</p>
                              <Input type="datetime-local" value={(link as any).scheduled_end || ""} onChange={e => debLink(link.id, { scheduled_end: e.target.value } as any)} className="h-7 text-xs bg-secondary/40 border-transparent" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

              {/* Sticky preview */}
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

                {/* Profile Photo */}
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

                {/* Profile Info */}
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

                {/* Theme & Colors */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Theme & Colors</h2>

                  {/* Themes — free gets 2, gradient is pro */}
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

                  {/* Background color */}
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

                  {/* Button style */}
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

                {/* Background image — Pro only */}
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
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                        ×
                      </button>
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

                {/* Free branding notice */}
                {!isPro && (
                  <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex items-start gap-4">
                    <TreesIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Powered by Linkso branding</p>
                      <p className="text-xs text-muted-foreground mt-1">Your profile shows "Made with Linkso" and a link back to us. <button onClick={() => navigate("/upgrade")} className="text-primary hover:underline">Upgrade to remove it.</button></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky preview */}
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

                {/* Hero */}
                <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-primary/5 to-purple-500/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h1 className="text-xl font-heading font-bold flex items-center gap-2">Pro Features <ProBadge /></h1>
                      {isPro
                        ? <p className="text-sm text-muted-foreground">Active until {new Date(profile!.pro_expires_at!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                        : <p className="text-sm text-muted-foreground">Unlock all features below for <button onClick={() => navigate("/upgrade")} className="text-primary font-semibold hover:underline">₹99/mo</button></p>}
                    </div>
                  </div>
                  {!isPro && (
                    <Button variant="hero" onClick={() => navigate("/upgrade")} className="w-full md:w-auto">
                      <Zap className="h-4 w-4 mr-2" />Upgrade to Pro · ₹99/month
                    </Button>
                  )}
                </div>

                {/* 1. Verified Badge */}
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

                {/* 2. Remove Branding */}
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

                {/* 3. Custom Font */}
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

                {/* 4. Animated Background */}
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

                {/* 5. Password Protection */}
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

                {/* 6. QR Code */}
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

                {/* 7. Custom Domain */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-4 relative overflow-hidden">
                  {!isPro && <FreeLock label="Custom Domain" onClick={() => navigate("/upgrade")} />}
                  <h2 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Custom Domain</h2>
                  <p className="text-sm text-muted-foreground">Point your own domain (e.g. <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">links.yourname.com</code>) to your Linkso profile.</p>
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

              {/* Sticky preview */}
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

              {/* Advanced — Pro gated */}
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

              {/* Plan */}
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

              {/* Account */}
              <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold">Account</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="mt-1 text-sm bg-secondary/40 px-3 py-2 rounded-lg">{user?.email}</p>
                </div>
              </section>

              {/* Username */}
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

              {/* Danger */}
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