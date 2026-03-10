import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Crown,
  Loader2,
  ArrowLeft,
  Sparkles,
  Shield,
  BadgeCheck,
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
  order_id: string;
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
interface RazorpayInstance {
  open(): void;
}

// ── Plan config ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "monthly",
    label: "30-Day Access",
    price: "₹99",
    priceNote: "one-time · no renewal",
    description: "Try premium risk-free",
    icon: Zap,
    badge: null,
    highlighted: false,
    features: [
      "Unlimited links",
      "Custom link slugs",
      "Analytics dashboard",
      "Custom profile themes",
      "Priority support",
    ],
  },
  {
    key: "yearly",
    label: "1-Year Access",
    price: "₹999",
    priceNote: "one-time · best value",
    description: "Save ₹189 vs monthly",
    icon: Crown,
    badge: "Most Popular",
    highlighted: true,
    features: [
      "Everything in 30-Day",
      "Advanced analytics",
      "Remove Linkso branding",
      "Custom domain support",
      "Early access to new features",
      "Dedicated support",
    ],
  },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const navigate = useNavigate();

  const handlePurchase = async (planKey: PlanKey) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    setLoadingPlan(planKey);

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Payment gateway failed to load. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // 2. Create order via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { plan: planKey } }
      );

      if (error || !data?.order_id) {
        toast.error("Could not initiate payment. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // 3. Prefill user info
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .single();

      // 4. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Linkso",
        description: data.label,
        order_id: data.order_id,
        prefill: {
          name: profile?.display_name ?? "",
          email: session.user.email ?? "",
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
            toast.info("Payment cancelled.");
          },
        },
        handler: async (response: RazorpayResponse) => {
          // 5. Verify on backend
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

          if (ve || !vd?.success) {
            toast.error(
              "Payment verification failed. Contact support if amount was deducted."
            );
          } else {
            toast.success(`🎉 ${data.label} activated! Enjoy Linkso premium.`);
            navigate("/dashboard");
          }
          setLoadingPlan(null);
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ── decorative glows ── */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">

        {/* ── back link ── */}
        <div className="w-full mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        {/* ── header ── */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full border border-primary/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            One-time payment · No subscriptions
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight">
            Upgrade to Premium
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Pay once, get full access. No recurring charges, no surprises.
          </p>
        </div>

        {/* ── plan cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.key;
            const isDisabled = loadingPlan !== null;

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all duration-200 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {/* badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow">
                      <BadgeCheck className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      plan.highlighted ? "bg-primary/20" : "bg-secondary"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        plan.highlighted ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg leading-tight">
                      {plan.label}
                    </h2>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-heading font-bold">{plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.priceNote}</p>
                </div>

                {/* features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex-shrink-0 w-4 h-4 bg-primary/15 rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full h-12 text-sm font-semibold"
                  variant={plan.highlighted ? "hero" : "outline"}
                  disabled={isDisabled}
                  onClick={() => handlePurchase(plan.key)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    `Get ${plan.label}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* ── trust strip ── */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Secured by Razorpay
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" />
              UPI · Cards · Net Banking
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Instant activation
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center max-w-sm">
            Access activates immediately after payment. No refunds for used periods.
            Need help?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}