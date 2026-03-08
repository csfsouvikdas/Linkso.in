import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TreesIcon, LinkIcon, Palette, BarChart3, Settings, ExternalLink, Copy, Plus, GripVertical, Trash2, LogOut, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/PlatformIcon";
import { detectPlatform } from "@/utils/detectPlatform";
import type { UserProfile, UserLink } from "@/types";

type Tab = "links" | "appearance" | "analytics" | "settings";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    const [profileRes, linksRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("links").select("*").eq("user_id", userId).order("position"),
    ]);
    if (profileRes.data) setProfile(profileRes.data as UserProfile);
    if (linksRes.data) setLinks(linksRes.data as UserLink[]);
    setLoading(false);
  };

  const addLink = async () => {
    if (!user) return;
    const newLink = {
      user_id: user.id,
      title: "New Link",
      url: "",
      platform: "other",
      is_active: true,
      position: links.length,
    };
    const { data, error } = await supabase.from("links").insert(newLink).select().single();
    if (error) { toast.error("Failed to add link"); return; }
    setLinks([...links, data as UserLink]);
    toast.success("Link added!");
  };

  const updateLink = async (id: string, updates: Partial<UserLink>) => {
    if (updates.url) {
      updates.platform = detectPlatform(updates.url);
    }
    const { error } = await supabase.from("links").update(updates).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setLinks(links.filter(l => l.id !== id));
    toast.success("Link deleted");
  };

  const copyLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    toast.success("Link copied to clipboard!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { tab: "links" as Tab, icon: LinkIcon, label: "Links" },
    { tab: "appearance" as Tab, icon: Palette, label: "Appearance" },
    { tab: "analytics" as Tab, icon: BarChart3, label: "Analytics" },
    { tab: "settings" as Tab, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-secondary/20 flex flex-col p-4 space-y-6 hidden md:flex">
        <div className="flex items-center gap-2 px-2">
          <TreesIcon className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold">Linktree</span>
        </div>

        {profile && (
          <div className="flex items-center gap-3 p-3 glass rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
            </div>
          </div>
        )}

        <nav className="space-y-1 flex-1">
          {navItems.map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === tab ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {profile && (
          <div className="space-y-2">
            <Button variant="hero-outline" size="sm" className="w-full" asChild>
              <Link to={`/${profile.username}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View My Page
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="w-full" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy My Link
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary/90 backdrop-blur-lg border-t border-border flex justify-around py-2">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-20 md:pb-8">
        {activeTab === "links" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-heading font-bold">Your Links</h1>
              <Button variant="hero" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4 mr-2" /> Add Link
              </Button>
            </div>

            {profile && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your unique Linktree</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-3 font-mono text-sm truncate">
                    {window.location.origin}/{profile.username}
                  </div>
                  <Button variant="hero" size="sm" onClick={copyLink}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button variant="hero-outline" size="sm" asChild>
                    <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this link in your social media bios — it's unique to you!</p>
              </div>
            )}

            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
                  <PlatformIcon platform={link.platform} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Input
                      value={link.title}
                      onChange={e => updateLink(link.id, { title: e.target.value })}
                      placeholder="Link title"
                      className="bg-secondary/50 border-border h-9"
                    />
                    <Input
                      value={link.url}
                      onChange={e => updateLink(link.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="bg-secondary/50 border-border h-9"
                    />
                  </div>
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={checked => updateLink(link.id, { is_active: checked })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => deleteLink(link.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {links.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-heading font-semibold mb-2">No links yet</p>
                  <p className="text-sm">Click "Add Link" to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-heading font-bold">Appearance</h1>
            
            {/* Profile Picture Upload */}
            <div className="glass rounded-xl p-6 space-y-4">
              <label className="text-sm font-medium">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-border">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-heading font-bold text-muted-foreground">
                        {profile?.display_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="h-6 w-6 text-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;
                        const ext = file.name.split('.').pop();
                        const filePath = `${user.id}/avatar.${ext}`;
                        
                        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
                        if (uploadError) { toast.error("Upload failed"); return; }
                        
                        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                        const avatarUrl = urlData.publicUrl + '?t=' + Date.now();
                        
                        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
                        setProfile(p => p ? { ...p, avatar_url: avatarUrl } : p);
                        toast.success("Profile picture updated!");
                      }}
                    />
                  </label>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload a photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={profile?.display_name || ""}
                  onChange={async e => {
                    const val = e.target.value;
                    setProfile(p => p ? { ...p, display_name: val } : p);
                    await supabase.from("profiles").update({ display_name: val }).eq("id", user.id);
                  }}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Input
                  value={profile?.bio || ""}
                  maxLength={80}
                  onChange={async e => {
                    const val = e.target.value;
                    setProfile(p => p ? { ...p, bio: val } : p);
                    await supabase.from("profiles").update({ bio: val }).eq("id", user.id);
                  }}
                  placeholder="Tell the world about yourself"
                  className="bg-secondary/50 border-border"
                />
                <p className="text-xs text-muted-foreground">{(profile?.bio || "").length}/80</p>
              </div>
            </div>
            {/* Card Customization */}
            <div className="bg-card rounded-2xl p-6 space-y-5 shadow-sm border border-border">
              <h2 className="text-lg font-heading font-semibold">Profile Card Style</h2>
              
              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Background Color</label>
                <div className="flex flex-wrap gap-3">
                  {["#FFFFFF", "#F0FDF4", "#F0F9FF", "#FFF7ED", "#FDF2F8", "#F5F3FF", "#1A1A2E", "#0F172A", "#18181B"].map(color => (
                    <button
                      key={color}
                      onClick={async () => {
                        setProfile(p => p ? { ...p, bg_color: color } : p);
                        await supabase.from("profiles").update({ bg_color: color }).eq("id", user.id);
                        toast.success("Background updated!");
                      }}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${profile?.bg_color === color ? "border-primary scale-110 shadow-md" : "border-border hover:scale-105"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="w-10 h-10 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="color"
                      value={profile?.bg_color || "#FFFFFF"}
                      className="hidden"
                      onChange={async (e) => {
                        const val = e.target.value;
                        setProfile(p => p ? { ...p, bg_color: val } : p);
                        await supabase.from("profiles").update({ bg_color: val }).eq("id", user.id);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Button Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "rounded", label: "Rounded", cls: "rounded-2xl" },
                    { value: "pill", label: "Pill", cls: "rounded-full" },
                    { value: "sharp", label: "Sharp", cls: "rounded-none" },
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={async () => {
                        setProfile(p => p ? { ...p, button_style: style.value } : p);
                        await supabase.from("profiles").update({ button_style: style.value }).eq("id", user.id);
                        toast.success("Button style updated!");
                      }}
                      className={`p-3 border-2 ${style.cls} text-sm font-medium transition-all ${profile?.button_style === style.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", bg: "#FFFFFF", fg: "#1a1a1a" },
                    { value: "dark", label: "Dark", bg: "#1A1A2E", fg: "#ffffff" },
                    { value: "gradient", label: "Gradient", bg: "linear-gradient(135deg, #667eea, #764ba2)", fg: "#ffffff" },
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={async () => {
                        setProfile(p => p ? { ...p, theme: t.value } : p);
                        await supabase.from("profiles").update({ theme: t.value }).eq("id", user.id);
                        toast.success("Theme updated!");
                      }}
                      className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${profile?.theme === t.value ? "border-primary scale-105 shadow-md" : "border-border hover:border-primary/50"}`}
                      style={{ background: t.bg, color: t.fg }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-card rounded-2xl p-6 space-y-4 shadow-sm border border-border">
              <h2 className="text-lg font-heading font-semibold">Live Preview</h2>
              <div className="flex justify-center">
                <div className="w-[280px] rounded-[2rem] border-[6px] border-foreground/10 shadow-xl overflow-hidden">
              <div
                className="p-6 flex flex-col items-center gap-3 min-h-[420px] transition-all"
                style={{
                  background: profile?.theme === "gradient" ? "linear-gradient(135deg, #667eea, #764ba2)" : (profile?.bg_color || "#FFFFFF"),
                  color: ["dark", "gradient"].includes(profile?.theme || "") || (profile?.bg_color && parseInt(profile.bg_color.replace("#",""), 16) < 0x808080) ? "#ffffff" : "#1a1a1a",
                }}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-black/10 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{profile?.display_name?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <p className="font-heading font-bold">{profile?.display_name || "Your Name"}</p>
                {profile?.bio && <p className="text-sm opacity-70">{profile.bio}</p>}
                <div className="w-full max-w-[250px] space-y-2">
                  {links.slice(0, 3).map(link => {
                    const btnRadius = profile?.button_style === "pill" ? "9999px" : profile?.button_style === "sharp" ? "0" : "16px";
                    return (
                      <div key={link.id} className="w-full p-2.5 text-center text-xs font-medium border border-current/20 opacity-80" style={{ borderRadius: btnRadius, background: "rgba(128,128,128,0.15)" }}>
                        {link.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-heading font-bold">Analytics</h1>
            <div className="glass rounded-xl p-6 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-heading font-semibold mb-2">Analytics coming soon</p>
              <p className="text-sm">Track profile views and link clicks here.</p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-heading font-bold">Settings</h1>
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ""} disabled className="bg-secondary/50 border-border opacity-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={profile?.username || ""} disabled className="bg-secondary/50 border-border opacity-50" />
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
