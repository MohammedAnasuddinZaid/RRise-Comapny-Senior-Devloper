"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Check, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useRequireAuth } from "../../lib/authGuard";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

// Default plan display info — prices fetched live from system_settings
const PLAN_INFO: Record<string, { name: string; period: string; features: string[] }> = {
  free: {
    name: "RRise Free",
    period: "forever",
    features: ["Goals & habits", "Tasks & dashboards", "Streaks & mascot", "Limited Alex AI"],
  },
  pro: {
    name: "RRise Pro",
    period: "per month",
    features: [
      "Unlimited Alex AI",
      "AI insights & recommendations",
      "AI generated plans",
      "Advanced analytics",
      "Deeper personalisation",
    ],
  },
  ultra: {
    name: "RRise Ultra",
    period: "per month",
    features: [
      "Everything in Pro",
      "Human accountability partner",
      "Personalised check-ins",
      "Priority support",
      "Future community access",
    ],
  },
};

function CheckoutContent() {
  const { user, loading } = useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [planId, setPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({ pro: "20", ultra: "40" });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live prices from system_settings
  useEffect(() => {
    async function fetchPrices() {
      try {
        const supabase = createClientComponentClient();
        if (!supabase) return;
        const { data } = await supabase
          .from("system_settings")
          .select("key, value")
          .in("key", ["stripe_pro_price", "stripe_ultra_price"]);
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row: any) => { map[row.key] = row.value; });
          setPrices({
            pro: map["stripe_pro_price"] || "20",
            ultra: map["stripe_ultra_price"] || "40",
          });
        }
      } catch (_) {
        // fall back to defaults
      } finally {
        setPricesLoading(false);
      }
    }
    fetchPrices();
  }, []);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan && (plan === "pro" || plan === "ultra")) {
      setPlanId(plan);
    } else {
      router.push("/pricing");
    }
  }, [searchParams, router]);

  const handleCheckout = async () => {
    if (!user || !planId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You need to be logged in to complete checkout. Redirecting to login...");
        setTimeout(() => {
          router.push("/login?redirect=/checkout?plan=" + planId);
        }, 1500);
        setIsProcessing(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError("Network error. Please check your connection and try again.");
      setIsProcessing(false);
    }
  };

  if (loading || pricesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login?redirect=/checkout?plan=" + planId);
    return null;
  }

  const plan = planId ? PLAN_INFO[planId] : null;
  const priceDisplay = planId && planId !== "free" ? `$${prices[planId]}` : "$0";

  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-2">Complete Your Upgrade</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You&apos;re upgrading to {plan?.name}
          </p>

          {plan && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg">{plan.name}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{priceDisplay}</span>
                  <span className="text-sm text-muted-foreground block">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Secure payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime — no lock-in</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Instant access after payment</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!stripeConfigured && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Stripe Not Configured</p>
                <p className="text-muted-foreground mt-1">
                  Add <code className="bg-surface px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
                  <code className="bg-surface px-1 rounded">STRIPE_SECRET_KEY</code> to your environment to enable payments.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={isProcessing || !stripeConfigured}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <button
            onClick={() => router.push("/pricing")}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to pricing
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
