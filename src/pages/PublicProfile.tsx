import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
import { platformLabels, type Platform } from "@/utils/detectPlatform";
import { motion } from "framer-motion";
import { TreesIcon } from "lucide-react";
import type { UserProfile, UserLink } from "@/types";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username!.toLowerCase())
      .maybeSingle();

    if (!profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData as UserProfile);

    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("is_active", true)
      .order("position");

    if (linksData) setLinks(linksData as UserLink[]);

    // Record profile view
    await supabase.from("analytics_views").insert({ user_id: profileData.id });

    setLoading(false);
  };

  const handleLinkClick = async (link: UserLink) => {
    await supabase.from("analytics_clicks").insert({
      link_id: link.id,
      user_id: link.user_id,
    });
    window.open(link.url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-4">Page not found</h1>
          <p className="text-muted-foreground mb-6">This username hasn't been claimed yet.</p>
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Claim it now →
          </Link>
        </div>
      </div>
    );
  }

  const bgStyle = profile?.theme === "gradient"
    ? "linear-gradient(135deg, #667eea, #764ba2)"
    : profile?.bg_color || "#FFFFFF";
  const isDark = profile?.theme === "dark" || profile?.theme === "gradient" ||
    (profile?.bg_color && parseInt(profile.bg_color.replace("#", ""), 16) < 0x808080);
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const btnRadius = profile?.button_style === "pill" ? "9999px" : profile?.button_style === "sharp" ? "0" : "16px";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12" style={{ background: bgStyle, color: textColor }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 relative"
      >
        {/* Profile header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-heading font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">{profile?.display_name}</h1>
            {profile?.bio && <p className="text-sm mt-1" style={{ opacity: 0.7 }}>{profile.bio}</p>}
          </div>
        </div>

        {/* Links with platform icons */}
        <div className="space-y-3">
          {links.map((link, i) => (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleLinkClick(link)}
              className="w-full p-4 flex items-center gap-4 cursor-pointer text-left group transition-transform hover:scale-[1.02]"
              style={{
                borderRadius: btnRadius,
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ borderRadius: btnRadius === "0" ? "4px" : "12px", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)" }}>
                <PlatformIcon platform={link.platform} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block">{link.title}</span>
                <span className="text-xs block" style={{ opacity: 0.6 }}>
                  {platformLabels[link.platform as Platform] || "Link"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {links.length === 0 && (
          <p className="text-center text-sm" style={{ opacity: 0.5 }}>No links added yet.</p>
        )}

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 pt-8" style={{ opacity: 0.3 }}>
          <TreesIcon className="h-4 w-4" />
          <Link to="/" className="text-xs">Made with Linktree</Link>
        </div>
      </motion.div>
    </div>
  );
}
