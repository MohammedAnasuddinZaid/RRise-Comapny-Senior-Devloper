"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Check, ArrowRight, AlertCircle } from "lucide-react";
import { useRequireAuth } from "../../lib/authGuard";
import { useRouter } from "next/navigation";

const PLANS = {
  free: { name: "RRise Free", price: "$0", period: "forever" },
  pro: { name: "RRise Pro", price: "$29", period: "per month" },
  elite: { name: "RRise Elite", price: "$99", period: "per month" },
};

function CheckoutContent() {
  const { user, loading } = useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [planId, setPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && (plan === 'pro' || plan === 'elite')) {
      setPlanId(plan);
    } else {
      // Redirect to pricing if no valid plan
      router.push('/pricing');
    }
  }, [searchParams, router]);

  const handleCheckout = async () => {
    if (!user || !planId) return;

    setIsProcessing(true);

    try {
      // Call Stripe checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
  };

  if (loading) {
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
    // Redirect to login if not authenticated
    router.push('/login?redirect=/checkout?plan=' + planId);
    return null;
  }

  const plan = planId ? PLANS[planId as keyof typeof PLANS] : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Upgrade</h1>
          
          {plan && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{plan.name}</span>
                <span className="text-2xl font-bold">{plan.price}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.period}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Secure payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Instant access to all features</span>
            </div>
          </div>

          {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Stripe Not Configured</p>
                <p className="text-muted-foreground mt-1">
                  Stripe checkout is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={isProcessing || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
            className="w-full"
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <button
            onClick={() => router.push('/pricing')}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
