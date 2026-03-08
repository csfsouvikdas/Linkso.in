import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreesIcon, ArrowRight, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase.from("profiles").select("id").eq("username", username.toLowerCase()).maybeSingle();
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
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, username: username.toLowerCase() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the verification code!");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    setVerifying(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email verified! Welcome to Linktree 🎉");
      navigate("/dashboard");
    }
  };

  const handleResend = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) toast.error(error.message);
    else toast.success("New code sent! Check your email.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <TreesIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-heading font-bold">Linktree</span>
          </Link>
          {step === "form" ? (
            <>
              <h1 className="text-3xl font-heading font-bold">Create your Linktree</h1>
              <p className="text-muted-foreground">Free forever. No credit card needed.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-heading font-bold">Verify your email</h1>
              <p className="text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
              </p>
            </>
          )}
        </div>

        {step === "form" ? (
          <form onSubmit={handleSignup} className="bg-card rounded-2xl p-8 space-y-5 shadow-sm border border-border">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} required className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input id="username" placeholder="janedoe" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} required className="bg-secondary/50 border-border pr-10" />
                {username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailable ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-destructive" />}
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="bg-secondary/50 border-border" />
            </div>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create your Linktree"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="bg-card rounded-2xl p-8 space-y-6 shadow-sm border border-border">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="hero" className="w-full" onClick={handleVerifyOtp} disabled={verifying || otp.length !== 6}>
              {verifying ? "Verifying..." : "Verify & Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              <button onClick={handleResend} className="text-primary hover:underline font-medium">
                Resend
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
