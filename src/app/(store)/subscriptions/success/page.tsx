"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard/advertiser");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for subscribing! Your account has been upgraded and you can now start creating advertisements.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              Redirecting to your dashboard in{" "}
              <span className="font-bold text-primary">{countdown}</span>{" "}
              seconds...
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => router.push("/dashboard/advertiser")}
            className="w-full"
          >
            Go to Dashboard Now
          </Button>
          <Button
            onClick={() => router.push("/subscriptions")}
            variant="outline"
            className="w-full"
          >
            View Plans
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
