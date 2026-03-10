import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check, Zap, Crown, Loader2, ArrowLeft, Sparkles, Shield, BadgeCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Razorpay types ────────────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance { open(): void; }

// ── Plan config ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "monthly" as const,
    label: "30-Day Access",
    price: "99",
    amountPaise: 9900,
    priceNote: "one-time · no renewal",
    description: "Try premium risk-free",
    icon: Zap,
    badge: null,
    highlighted: false,
    durationDays: 30,
    features: [
      "Unlimited links",
      "Custom link slugs",
      "Analytics dashboard",
      "Custom profile themes",
      "Priority support",
    ],
  },
  {
    key: "yearly" as const,
    label: "1-Year Access",
    price: "999",
    amountPaise: 99900,
    priceNote: "one-time · best value",
    description: "Save ₹189 vs monthly",
    icon: Crown,
    badge: "Most Popular",
    highlighted: true,
    durationDays: 365,
    features: [
      "Everything in 30-Day",
      "Advanced analytics",
      "Remove Linkso branding",
      "Custom domain support",
      "Early access to new features",
      "Dedicated support",
    ],
  },
];

type PlanKey = "monthly" | "yearly";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE TOGGLE
// Set USE_EDGE_FUNCTION = true once your edge function is deployed & working.
// Set USE_EDGE_FUNCTION = false to test the Razorpay popup directly right now.
// ─────────────────────────────────────────────────────────────────────────────
const USE_EDGE_FUNCTION = false; // ← CHANGE TO true once edge function is deployed

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [debugLog, setDebugLog]       = useState<string[]>([]);
  const navigate = useNavigate();

  const log = (msg: string) => {
    console.log(`[Upgrade] ${msg}`);
    setDebugLog(prev => [...prev, msg]);
  };

  useEffect(() => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    log(key ? `✅ Key: ${key.slice(0, 14)}...` : "❌ VITE_RAZORPAY_KEY_ID missing in .env");
    log(USE_EDGE_FUNCTION ? "ℹ️ Mode: Edge Function" : "ℹ️ Mode: Direct (no edge function needed)");
  }, []);

  // ── Activates pro in the DB using the correct column names ──────────────────
  // Dashboard reads: profile?.is_pro && profile?.pro_expires_at
  // So we MUST write to those exact columns.
  const activateProInDB = async (userId: string, planKey: PlanKey): Promise<boolean> => {
    const plan = PLANS.find(p => p.key === planKey)!;
    const expiresAt = new Date(Date.now() + plan.durationDays * 86_400_000).toISOString();

    log(`Writing to DB → is_pro=true, pro_expires_at=${expiresAt}`);

    const { error } = await supabase
      .from("profiles")
      .update({
        is_pro: true,
        pro_expires_at: expiresAt,
      })
      .eq("id", userId);

    if (error) {
      log(`❌ DB update failed: ${error.message}`);
      return false;
    }

    log(`✅ Pro activated until ${expiresAt}`);
    return true;
  };

  const handlePurchase = async (planKey: PlanKey) => {
    const plan = PLANS.find(p => p.key === planKey)!;
    log(`\n--- Purchase: ${planKey} ---`);

    // Step 1 — Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }
    log(`✅ Auth OK: ${session.user.email}`);
    setLoadingPlan(planKey);

    try {
      // Step 2 — Load SDK
      log("Loading Razorpay SDK...");
      const loaded = await loadRazorpay();
      if (!loaded) {
        log("❌ SDK load failed");
        toast.error("Payment SDK failed to load. Check your internet.");
        setLoadingPlan(null);
        return;
      }
      log("✅ SDK loaded");

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        log("❌ Missing VITE_RAZORPAY_KEY_ID");
        toast.error("Add VITE_RAZORPAY_KEY_ID to .env and restart dev server.");
        setLoadingPlan(null);
        return;
      }

      let orderId: string | undefined;
      let amount = plan.amountPaise;

      if (USE_EDGE_FUNCTION) {
        // ── Path A: Edge Function creates the order ───────────────────────────
        log("Calling edge function create-razorpay-order...");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
            body: { plan: planKey },
          });
          clearTimeout(timeout);

          log(`  data: ${JSON.stringify(data)}`);
          log(`  error: ${JSON.stringify(error)}`);

          if (error) {
            const msg = error.message || "";
            if (msg.includes("404") || msg.includes("not found")) {
              log("❌ Function NOT deployed");
              toast.error('Run: supabase functions deploy create-razorpay-order');
            } else if (msg.includes("401") || msg.includes("Unauthorized")) {
              log("❌ Missing Supabase secrets");
              toast.error("Run: supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=...");
            } else if (msg.includes("non-2xx")) {
              log("❌ Function crashed — check Supabase → Functions → Logs");
              toast.error("Function error. Check Supabase dashboard logs.");
            } else {
              log(`❌ Error: ${msg}`);
              toast.error(`Edge function error: ${msg}`);
            }
            setLoadingPlan(null);
            return;
          }

          if (!data?.order_id) {
            log(`❌ No order_id. Got: ${JSON.stringify(data)}`);
            toast.error(data?.error || "No order_id from server");
            setLoadingPlan(null);
            return;
          }

          orderId = data.order_id;
          amount  = data.amount;
          log(`✅ Order: ${orderId}`);
        } catch (e) {
          clearTimeout(timeout);
          if ((e as Error).name === "AbortError") {
            log("❌ Edge function TIMED OUT after 10s — is it deployed?");
            toast.error("Edge function timed out. Is it deployed? Check Supabase dashboard.");
          } else {
            log(`❌ Invoke threw: ${(e as Error).message}`);
            toast.error(`Edge function error: ${(e as Error).message}`);
          }
          setLoadingPlan(null);
          return;
        }
      } else {
        // ── Path B: Direct mode (no edge function) ────────────────────────────
        log("ℹ️ Direct mode — skipping edge function");
        log(`ℹ️ Amount: ${amount} paise = ₹${amount / 100}`);
      }

      // Step 3 — Open Razorpay
      log("Opening Razorpay checkout...");

      const options: RazorpayOptions = {
        key: rzpKey,
        amount,
        currency: "INR",
        name: "Linkso",
        description: plan.label,
        ...(orderId ? { order_id: orderId } : {}),
        prefill: {
          name: session.user.user_metadata?.display_name || "",
          email: session.user.email || "",
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            log("ℹ️ Popup closed by user");
            setLoadingPlan(null);
          },
        },
        handler: async (response: RazorpayResponse) => {
          log(`✅ Payment done: ${response.razorpay_payment_id}`);

          if (USE_EDGE_FUNCTION) {
            // Verify via edge function
            setLoadingPlan(planKey);
            log("Verifying via edge function...");
            const { data: vd, error: ve } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: planKey,
                },
              }
            );
            log(`  verify data: ${JSON.stringify(vd)}`);
            log(`  verify error: ${JSON.stringify(ve)}`);

            if (ve || !vd?.success) {
              toast.error(`Verification failed. Save payment ID: ${response.razorpay_payment_id}`);
              setLoadingPlan(null);
            } else {
              log("✅ Verified! Activating plan in DB...");
              const ok = await activateProInDB(session.user.id, planKey);
              if (ok) {
                toast.success("🎉 Upgrade successful! Welcome to Pro.");
                navigate("/dashboard");
              } else {
                toast.error(`Payment verified but DB update failed. Payment ID: ${response.razorpay_payment_id} — contact support.`);
              }
              setLoadingPlan(null);
            }
          } else {
            // ── Direct mode — update is_pro + pro_expires_at ──────────────────
            setLoadingPlan(planKey);
            const ok = await activateProInDB(session.user.id, planKey);
            if (ok) {
              toast.success("🎉 Upgrade successful! Welcome to Pro.");
              navigate("/dashboard");
            } else {
              toast.error(`Payment received but activation failed. Payment ID: ${response.razorpay_payment_id} — contact support.`);
            }
            setLoadingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      log("✅ Popup should be visible now");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`❌ Caught: ${msg}`);
      toast.error(`Error: ${msg}`);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>

        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> One-time payment · No subscriptions
          </div>
          <h1 className="text-4xl font-heading font-bold">Upgrade to Premium</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Pay once, get full access. No recurring charges, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.key;
            return (
              <div key={plan.key} className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all duration-200 ${plan.highlighted ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow">
                      <BadgeCheck className="h-3 w-3" /> {plan.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${plan.highlighted ? "bg-primary/20" : "bg-secondary"}`}>
                    <Icon className={`h-5 w-5 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg">{plan.label}</h2>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-heading font-bold">₹{plan.price}</span>
                  <p className="text-xs text-muted-foreground mt-1">{plan.priceNote}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex-shrink-0 w-4 h-4 bg-primary/15 rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 text-sm font-semibold"
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={loadingPlan !== null}
                  onClick={() => handlePurchase(plan.key)}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </span>
                  ) : (
                    `Get ${plan.label}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secured by Razorpay</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> UPI · Cards · Net Banking</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Instant activation</span>
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center max-w-sm">
            Access activates immediately after payment.{" "}
            <Link to="/contact" className="text-primary hover:underline">Contact support</Link> if you face any issues.
          </p>
        </div>

       
        
      </div>
    </div>
  );
}