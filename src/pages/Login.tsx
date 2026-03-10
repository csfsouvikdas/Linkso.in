import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (data?.session) {
      // Session is automatically persisted by the Supabase client in localStorage.
      // Navigate only after we confirm a session exists.
      navigate("/dashboard");
    } else {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        const lovableResult = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (lovableResult.error) toast.error(lovableResult.error.message);
        else if (lovableResult.redirected) return;
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setStep("forgot-sent");
    }
  };

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
          {step === "login" && (
            <>
              <h1 className="text-3xl font-heading font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Log in to manage your links</p>
            </>
          )}
          {step === "forgot" && (
            <>
              <h1 className="text-3xl font-heading font-bold">Forgot password?</h1>
              <p className="text-muted-foreground">Enter your email and we'll send a reset link</p>
            </>
          )}
          {step === "forgot-sent" && (
            <>
              <h1 className="text-3xl font-heading font-bold">Check your email</h1>
              <p className="text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{resetEmail}</span>
              </p>
            </>
          )}
        </div>

        {/* ── LOGIN ─────────────────────────────────────────────────────────── */}
        {step === "login" && (
          <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">
            {/* Google */}
            <Button
              variant="outline"
              className="w-full h-11 gap-3 font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setResetEmail(email); setStep("forgot"); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* ── FORGOT PASSWORD ───────────────────────────────────────────────── */}
        {step === "forgot" && (
          <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button variant="hero" className="w-full" type="submit" disabled={resetLoading}>
                {resetLoading ? "Sending..." : "Send reset link"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <button
              onClick={() => setStep("login")}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to log in
            </button>
          </div>
        )}

        {/* ── RESET EMAIL SENT ──────────────────────────────────────────────── */}
        {step === "forgot-sent" && (
          <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={() => { setStep("login"); setResetEmail(""); }}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to log in
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}