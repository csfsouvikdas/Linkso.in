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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 relative"
      >
        {/* Profile header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center border-2 border-primary/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-heading font-bold text-primary-foreground">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">{profile?.display_name}</h1>
            {profile?.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
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
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover-lift cursor-pointer text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <PlatformIcon platform={link.platform} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block">{link.title}</span>
                <span className="text-xs text-muted-foreground truncate block">
                  {platformLabels[link.platform as Platform] || "Link"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {links.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">No links added yet.</p>
        )}

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 pt-8 opacity-40 hover:opacity-70 transition-opacity">
          <TreesIcon className="h-4 w-4" />
          <Link to="/" className="text-xs">Made with Linktree</Link>
        </div>
      </motion.div>
    </div>
  );
}
