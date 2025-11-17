"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your subscription payment was not completed
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            No charges were made to your account. You can try again whenever you're ready.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => router.push("/subscriptions")}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
