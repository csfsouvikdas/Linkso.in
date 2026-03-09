import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, Check, X, Eye, EyeOff } from "lucide-react";
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

  // Supabase puts the access token in the URL hash when user clicks the reset link.
  // We need to let Supabase pick it up and establish a session.
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Supabase has detected the recovery token — session is now valid
        setValidSession(true);
        setChecking(false);
      } else if (session) {
        setValidSession(true);
        setChecking(false);
      } else {
        setChecking(false);
      }
    });

    // Also check if session already exists (page reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });
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
      toast.success("Password updated! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Invalid / expired link
  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <X className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-xl font-heading font-bold">Link expired</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link has expired or already been used.
          </p>
          <Button variant="hero" className="w-full" asChild>
            <Link to="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="w-full max-w-md space-y-8 relative">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <TreesIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-heading font-bold">Linkso</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Set new password</h1>
          <p className="text-muted-foreground">Choose a strong password for your account</p>
        </div>

        <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">
          <form onSubmit={handleReset} className="space-y-4">

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
                  className="bg-secondary/50 border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {passwordChecks.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < passedChecks.length
                          ? passedChecks.length === 4 ? "bg-primary"
                            : passedChecks.length >= 2 ? "bg-yellow-400"
                            : "bg-red-400"
                          : "bg-secondary"
                      }`} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordChecks.map(check => {
                      const passed = check.test(password);
                      return (
                        <div key={check.label} className="flex items-center gap-2">
                          {passed
                            ? <Check className="h-3 w-3 text-primary flex-shrink-0" />
                            : <X className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
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
                className={`bg-secondary/50 border-border ${
                  confirm.length > 0
                    ? passwordsMatch ? "border-primary/50" : "border-destructive/50"
                    : ""
                }`}
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading || !allChecksPassed || !passwordsMatch}
            >
              {loading ? "Updating…" : "Update Password"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}