import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const passwordChecks = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",           test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const navigate = useNavigate();

  const passedChecks = passwordChecks.filter(c => c.test(password));
  const allChecksPassed = passedChecks.length === passwordChecks.length;

  // Username availability check with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameAvailable) {
      toast.error("Please choose an available username");
      return;
    }

    if (!allChecksPassed) {
      toast.error("Please meet all password requirements");
      setShowPasswordHints(true);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          username: username.toLowerCase(),
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Upsert profile immediately
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: name,
        updated_at: new Date().toISOString(),
      });
    }

    setLoading(false);
    toast.success("Account created! Welcome to Linkso 🎉");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="w-full max-w-md space-y-8 relative">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <TreesIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-heading font-bold">Linkso</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Create your Linkso</h1>
          <p className="text-muted-foreground">Free forever. No credit card needed.</p>
        </div>

        <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">

          {/* Google Sign-Up */}
          <Button
            variant="outline"
            className="w-full h-11 gap-3 font-medium"
            type="button"
            onClick={async () => {
              try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                });
                if (error) {
                  const lovableResult = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (lovableResult.error) toast.error(lovableResult.error.message);
                  else if (lovableResult.redirected) return;
                } else if (data?.url) {
                  window.location.href = data.url;
                }
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Google sign-up failed");
              }
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="janedoe"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  required
                  className="bg-secondary/50 border-border pr-10"
                />
                {username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailable
                      ? <Check className="h-4 w-4 text-primary" />
                      : <X className="h-4 w-4 text-destructive" />
                    }
                  </div>
                )}
                {username.length >= 3 && checkingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
              {username.length >= 3 && !checkingUsername && usernameAvailable === false && (
                <p className="text-xs text-destructive">Username is taken</p>
              )}
              {username.length >= 3 && !checkingUsername && usernameAvailable === true && (
                <p className="text-xs text-primary">Username is available!</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setShowPasswordHints(true);
                }}
                onFocus={() => setShowPasswordHints(true)}
                required
                className="bg-secondary/50 border-border"
              />

              {/* Password strength bar */}
              {showPasswordHints && password.length > 0 && (
                <div className="space-y-2 pt-1">
                  {/* Progress bar */}
                  <div className="flex gap-1">
                    {passwordChecks.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passedChecks.length
                            ? passedChecks.length === 4 ? "bg-primary"
                              : passedChecks.length >= 2 ? "bg-yellow-400"
                              : "bg-red-400"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Checklist */}
                  <div className="space-y-1">
                    {passwordChecks.map((check) => {
                      const passed = check.test(password);
                      return (
                        <div key={check.label} className="flex items-center gap-2">
                          {passed
                            ? <Check className="h-3 w-3 text-primary flex-shrink-0" />
                            : <X className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          }
                          <span className={`text-xs ${passed ? "text-primary" : "text-muted-foreground"}`}>
                            {check.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="hero"
              className="w-full"
              type="submit"
              disabled={loading || !usernameAvailable || !allChecksPassed}
            >
              {loading ? "Creating account..." : "Create your Linkso"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}