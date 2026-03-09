import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, Check, X, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const passwordChecks = [
  { label: "At least 8 characters",  test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",              test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const [password, setPassword]           = useState("");
  const [confirm, setConfirm]             = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [validSession, setValidSession]   = useState(false);
  const [checking, setChecking]           = useState(true);
  const navigate = useNavigate();

  const passedChecks   = passwordChecks.filter(c => c.test(password));
  const allChecksPassed = passedChecks.length === passwordChecks.length;
  const passwordsMatch  = password === confirm && confirm.length > 0;

  useEffect(() => {
    // Listen for the recovery event or an existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setValidSession(true);
      }
      setChecking(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecksPassed) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/login");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying security token...</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold">Invalid Link</h2>
            <p className="text-sm text-muted-foreground">
              This password reset link has expired, is invalid, or has already been used.
            </p>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <TreesIcon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight">Linkso</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Secure your account</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="bg-card rounded-2xl p-8 space-y-6 shadow-xl border border-border/50 backdrop-blur-sm">
          <form onSubmit={handleReset} className="space-y-5">
            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-secondary/30 border-border focus:ring-primary/20 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength UI */}
              {password.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-1.5">
                    {passwordChecks.map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i < passedChecks.length
                          ? passedChecks.length === 4 ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                            : passedChecks.length >= 2 ? "bg-yellow-400"
                            : "bg-red-500"
                          : "bg-secondary"
                      }`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {passwordChecks.map(check => {
                      const passed = check.test(password);
                      return (
                        <div key={check.label} className="flex items-center gap-2">
                          <div className={`p-0.5 rounded-full ${passed ? "bg-primary/20" : "bg-secondary"}`}>
                            {passed ? <Check className="h-2.5 w-2.5 text-primary" /> : <X className="h-2.5 w-2.5 text-muted-foreground/50" />}
                          </div>
                          <span className={`text-[10px] font-medium ${passed ? "text-foreground" : "text-muted-foreground"}`}>
                            {check.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className={`bg-secondary/30 border-border h-11 transition-all ${
                  confirm.length > 0
                    ? passwordsMatch ? "border-primary/50 ring-1 ring-primary/20" : "border-destructive/50 ring-1 ring-destructive/20"
                    : ""
                }`}
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <X className="h-3 w-3" /> Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 shadow-lg shadow-primary/10 transition-transform active:scale-[0.98]"
              disabled={loading || !allChecksPassed || !passwordsMatch}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Update Password
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">Log in here</Link>
        </p>
      </div>
    </div>
  );
}