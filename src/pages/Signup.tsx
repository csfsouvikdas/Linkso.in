import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, Check, X, ShieldCheck, RefreshCw } from "lucide-react";
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
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  
  const [timer, setTimer] = useState(0);
  
  const navigate = useNavigate();

  const passedChecks = passwordChecks.filter(c => c.test(password));
  const allChecksPassed = passedChecks.length === passwordChecks.length;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const timerId = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timerId);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable) return toast.error("Please choose an available username");
    if (!allChecksPassed) return toast.error("Please meet all password requirements");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, username: username.toLowerCase() },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("verify");
    setTimer(60);
    toast.success("Verification code sent!");
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setTimer(60);
      toast.success("A new code has been sent!");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: name,
        updated_at: new Date().toISOString(),
      });
    }

    setLoading(false);
    toast.success("Account verified! Welcome to Linkso 🎉");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="w-full max-w-md space-y-8 relative">

        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <TreesIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-heading font-bold">Linkso</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold">
            {step === "signup" ? "Create your Linkso" : "Verify Email"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === "signup" 
              ? "Free forever. No credit card needed." 
              : `Enter the 8-digit code sent to ${email}`}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">
          {step === "signup" ? (
            <>
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
                    } else if (data?.url) window.location.href = data.url;
                  } catch (e) {
                    toast.error("Google sign-up failed");
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
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} required className="bg-secondary/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input id="username" placeholder="username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} required className="bg-secondary/50 pr-10" />
                    {username.length >= 3 && !checkingUsername && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameAvailable ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-destructive" />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => {setPassword(e.target.value); setShowPasswordHints(true);}} 
                    required 
                    className="bg-secondary/50" 
                  />
                  {showPasswordHints && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-1">
                        {passwordChecks.map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${i < passedChecks.length ? "bg-primary" : "bg-secondary"}`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordChecks.map((check) => {
                          const isMet = check.test(password);
                          return (
                            <div key={check.label} className="flex items-center gap-2">
                              {isMet ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <X className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={`text-[11px] ${isMet ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                {check.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="hero" className="w-full" type="submit" disabled={loading || !usernameAvailable || !allChecksPassed}>
                  {loading ? "Processing..." : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">8-Digit Code</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    placeholder="00000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="bg-secondary/50 text-center text-2xl tracking-[0.5em] font-mono h-14"
                    maxLength={8}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-30" />
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="hero" className="w-full h-12" type="submit" disabled={loading || otp.length < 8}>
                  {loading ? "Verifying..." : "Confirm Code"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timer > 0 || loading}
                    className="text-sm font-medium text-primary disabled:text-muted-foreground inline-flex items-center gap-2 hover:underline"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
                  </button>
                </div>

                <Button variant="ghost" className="w-full text-xs" type="button" onClick={() => setStep("signup")} disabled={loading}>
                  Change Email
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}