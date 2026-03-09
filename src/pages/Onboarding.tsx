import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TreesIcon, ArrowRight, Camera, User, AtSign, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STEPS = ["welcome", "username", "displayname", "bio", "avatar", "done"] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  const stepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length - 2; // exclude welcome and done

  const checkUsername = async (val: string) => {
    setUsernameError("");
    if (!val || val.length < 3) { setUsernameError("At least 3 characters required"); return false; }
    if (!/^[a-z0-9_]+$/.test(val)) { setUsernameError("Only lowercase letters, numbers, and underscores"); return false; }
    const { data } = await supabase.from("profiles").select("id").eq("username", val).maybeSingle();
    if (data) { setUsernameError("Username is already taken"); return false; }
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      toast.error("Authentication error: " + sessionError.message);
      setSaving(false);
      return;
    }

    if (!session) {
      navigate("/login");
      return;
    }

    const userId = session.user.id;

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username,
      display_name: displayName,
      bio,
      avatar_url: avatarUrl || null,
      is_onboarded: true,
    }, { onConflict: "id" });

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile: " + error.message);
      return;
    }
    navigate("/dashboard");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${session.user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
    toast.success("Photo uploaded!");
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Progress bar */}
      {step !== "welcome" && step !== "done" && (
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Step {stepIndex} of {totalSteps}</span>
            <span className="text-xs text-muted-foreground">{Math.round((stepIndex / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-md">

        {/* WELCOME */}
        {step === "welcome" && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <TreesIcon className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">Welcome to Linkso!</h1>
              <p className="text-muted-foreground">Let's set up your profile in just a few steps. It'll only take a minute.</p>
            </div>
            <Button variant="hero" className="w-full" size="lg" onClick={() => setStep("username")}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* USERNAME */}
        {step === "username" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <AtSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">Choose your username</h2>
                <p className="text-sm text-muted-foreground">This will be your unique Linkso URL</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* ✅ Fixed: prefix label + input side by side, no overlap */}
              <div className="flex items-center bg-secondary/50 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                <span className="pl-3 pr-1 text-sm text-muted-foreground whitespace-nowrap select-none">
                  linkso.in/
                </span>
                <input
                  value={username}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
                    setUsername(val);
                    setUsernameError("");
                  }}
                  placeholder="yourname"
                  maxLength={30}
                  className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none placeholder:text-muted-foreground text-foreground"
                />
              </div>
              {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
              {username.length >= 3 && !usernameError && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Looks good!
                </p>
              )}
            </div>

            <Button
              variant="hero"
              className="w-full"
              size="lg"
              onClick={async () => {
                const ok = await checkUsername(username);
                if (ok) setStep("displayname");
              }}
              disabled={username.length < 3}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* DISPLAY NAME */}
        {step === "displayname" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">What's your name?</h2>
                <p className="text-sm text-muted-foreground">This shows on your public profile</p>
              </div>
            </div>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your full name or nickname"
              className="bg-secondary/50 border-border"
              maxLength={50}
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("username")}>Back</Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => setStep("bio")}
                disabled={!displayName.trim()}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* BIO */}
        {step === "bio" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">Write a short bio</h2>
                <p className="text-sm text-muted-foreground">Tell visitors a little about yourself</p>
              </div>
            </div>
            <div className="space-y-1">
              <Input
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Creator, developer, coffee lover ☕"
                className="bg-secondary/50 border-border"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/80</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("displayname")}>Back</Button>
              <Button variant="hero" className="flex-1" onClick={() => setStep("avatar")}>
                {bio.trim() ? <>Continue <ArrowRight className="ml-2 h-4 w-4" /></> : "Skip"}
              </Button>
            </div>
          </div>
        )}

        {/* AVATAR */}
        {step === "avatar" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">Add a profile photo</h2>
                <p className="text-sm text-muted-foreground">Put a face to your name (optional)</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-32 h-32">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-heading font-bold text-muted-foreground">
                      {displayName?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="h-8 w-8 text-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              {uploading && <p className="text-sm text-muted-foreground animate-pulse">Uploading...</p>}
              {!uploading && !avatarUrl && (
                <label className="cursor-pointer">
                  <Button variant="secondary" size="sm" asChild>
                    <span><Camera className="h-4 w-4 mr-2" /> Choose Photo</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
              {avatarUrl && (
                <Button variant="secondary" size="sm" onClick={() => setAvatarUrl("")}>Remove Photo</Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("bio")}>Back</Button>
              <Button variant="hero" className="flex-1" onClick={() => setStep("done")} disabled={uploading}>
                {avatarUrl ? <>Continue <ArrowRight className="ml-2 h-4 w-4" /></> : "Skip"}
              </Button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-4 border-primary/30 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-heading font-bold">{displayName?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">You're all set, {displayName}! 🎉</h2>
              <p className="text-muted-foreground mt-1">Your Linkso is ready at</p>
              <p className="font-mono text-primary font-semibold mt-1">linkso.in/{username}</p>
            </div>
            <Button variant="hero" className="w-full" size="lg" onClick={handleFinish} disabled={saving}>
              {saving ? "Setting up..." : "Go to Dashboard →"}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}