// src/components/AdBanner.tsx
// Shows Google AdSense ads for FREE users only. Pro users see nothing.
// Place the AdSense <script> tag once in index.html (already done).

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

declare global { interface Window { adsbygoogle: any[] } }

interface AdBannerProps {
  isPro: boolean;
  className?: string;
}

/**
 * Real AdSense unit — renders actual ads in production
 * Credentials used: 
 * Publisher: pub-4615523524206065
 * Auth ID: f08c47fec0942fa0
 */
export function AdBanner({ isPro, className = "" }: AdBannerProps) {
  useEffect(() => {
    // Only initialize ads if the user is not a Pro member
    if (isPro) return;
    
    try { 
      (window.adsbygoogle = window.adsbygoogle || []).push({}); 
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [isPro]);

  if (isPro) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4615523524206065"   // Updated Publisher ID
        data-ad-slot="5857699705"                   // Your specific ad slot
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Visual placeholder shown in dev / when AdSense hasn't loaded yet
export function AdPlaceholder({ isPro, label }: { isPro: boolean; label?: string }) {
  if (isPro) return null;
  
  return (
    <div className="w-full rounded-xl border border-border bg-secondary/20 py-4 px-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">
          Advertisement - TwinStudio
        </p>
        <p className="text-xs text-muted-foreground">{label || "Support the platform"}</p>
      </div>
      <Link 
        to="/upgrade" 
        className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <Zap className="h-3 w-3 fill-current" /> Remove ads
      </Link>
    </div>
  );
}