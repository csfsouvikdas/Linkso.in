import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Zap, TreesIcon, Shield, Star, Globe, Bell, Type, Sparkles, QrCode, Layout } from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_ROEDQAv84pbQ27";

declare global { interface Window { Razorpay: any; } }

const FREE_FEATURES = [
  "Up to 3 links",
  "Basic themes (Light, Dark, Gradient)",
  "Button style customization",
  "Profile picture & bio",
  "Basic analytics (views + clicks)",
  "Google OAuth login",
  '"Powered by Linkso" branding',
];

const PRO_FEATURES = [
  { icon: Zap, text: "Unlimited links" },
  { icon: Shield, text: "Remove branding from profile" },
  { icon: Star, text: "Verified badge on profile" },
  { icon: Layout, text: "Advanced analytics (CTR, top links, charts)" },
  { icon: Sparkles, text: "Animated backgrounds" },
  { icon: Type, text: "Custom fonts (6 options)" },
  { icon: QrCode, text: "QR code for your profile" },
  { icon: Layout, text: "Priority link (pin to top)" },
  { icon: Layout, text: "Social icons row (compact display)" },
  { icon: Shield, text: "Password protected profile" },
  { icon: Bell, text: "Link click notifications (coming soon)" },
  { icon: Globe, text: "Custom domain " },
];

export default function UpgradePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => setProfile(data));
    });
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [navigate]);

  const handleUpgrade = async () => {
    if (!user || !profile) return;
    setLoading(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: billing === "monthly" ? 9900 : 99900,
      currency: "INR",
      name: "Linkso Pro",
      description: billing === "monthly" ? "Pro Monthly — ₹99/month" : "Pro Yearly — ₹999/year",
      prefill: { email: user.email, name: profile.display_name || "" },
      theme: { color: "#22c55e" },
      handler: async (response: any) => {
        const expiresAt = billing === "yearly"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase.from("profiles").update({
          is_pro: true,
          pro_expires_at: expiresAt,
          razorpay_subscription_id: response.razorpay_payment_id,
        }).eq("id", user.id);
        if (error) { toast.error("Failed to activate Pro"); return; }
        toast.success("🎉 Welcome to Linkso Pro!");
        navigate("/dashboard");
      },
      modal: { ondismiss: () => setLoading(false) },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { toast.error("Payment failed: " + r.error.description); setLoading(false); });
      rzp.open();
    } catch { toast.error("Something went wrong"); setLoading(false); }
  };

  if (profile?.is_pro && profile?.pro_expires_at && new Date(profile.pro_expires_at) > new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">You're already Pro! 🎉</h1>
          <p className="text-muted-foreground">Active until {new Date(profile.pro_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <Button variant="hero" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TreesIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-heading font-bold">Linkso</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Upgrade to Pro</h1>
          <p className="text-muted-foreground text-lg">Everything you need to grow your audience.</p>

          <div className="inline-flex items-center gap-1 bg-secondary/50 rounded-full p-1 mt-4">
            <button onClick={() => setBilling("monthly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("yearly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "yearly" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
              Yearly
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Save 16%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Free */}
          <div className="bg-card rounded-2xl p-8 border border-border space-y-6 flex flex-col">
            <div>
              <h2 className="text-xl font-heading font-bold">Free</h2>
              <p className="text-sm text-muted-foreground mt-1">Great for getting started</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-heading font-bold">₹0</span>
                <span className="text-muted-foreground mb-1">/forever</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>Current Plan</Button>
          </div>

          {/* Pro */}
          <div className="bg-card rounded-2xl p-8 border-2 border-primary shadow-lg shadow-primary/10 space-y-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" /> POPULAR
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">Pro <Zap className="h-5 w-5 text-primary" /></h2>
              <p className="text-sm text-muted-foreground mt-1">For creators who are serious</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-heading font-bold text-primary">₹{billing === "monthly" ? "99" : "999"}</span>
                <span className="text-muted-foreground mb-1">/{billing === "monthly" ? "month" : "year"}</span>
              </div>
              {billing === "yearly" && <p className="text-xs text-primary mt-1">Just ₹83/month — save ₹189 a year!</p>}
            </div>
            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />{text}
                </li>
              ))}
            </ul>
            <Button variant="hero" className="w-full" onClick={handleUpgrade} disabled={loading}>
              {loading ? "Opening payment..." : `Upgrade for ₹${billing === "monthly" ? "99/mo" : "999/yr"}`}
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-3 bg-secondary/30 px-6 py-4 text-sm font-semibold">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-primary">Pro</span>
          </div>
          {[
            ["Links", "5", "Unlimited"],
            ["Themes", "3", "3 + custom"],
            ["Analytics", "Basic", "Advanced"],
            ["Branding", "Shown", "Hidden"],
            ["Verified badge", "✗", "✓"],
            ["Animated backgrounds", "✗", "6 options"],
            ["Custom fonts", "✗", "6 options"],
            ["QR code", "✗", "✓"],
            ["Priority link", "✗", "✓"],
            ["Social icons row", "✗", "✓"],
            ["Password protection", "✗", "✓"],
            ["Link scheduling", "✗", "✓"],
            ["Custom domain", "✗", "New Feature"],
            ["Click notifications", "✗", "Soon"],
          ].map(([feature, free, pro], i) => (
            <div key={feature} className={`grid grid-cols-3 px-6 py-3.5 text-sm ${i % 2 === 0 ? "" : "bg-secondary/10"}`}>
              <span className="text-muted-foreground">{feature}</span>
              <span className="text-center text-muted-foreground">{free}</span>
              <span className="text-center font-medium text-primary">{pro}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">Secure payment via Razorpay · Cancel anytime · GST applicable</p>
      </div>
    </div>
  );
}