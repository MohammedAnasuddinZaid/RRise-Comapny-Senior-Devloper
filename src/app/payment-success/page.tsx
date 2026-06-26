"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // In production, this would verify the payment with Stripe
    // and update the user's plan in the database
    console.log('Payment successful - User plan should be updated');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Your account has been upgraded. You now have access to all premium features.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/app/dashboard')}
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="glass"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
