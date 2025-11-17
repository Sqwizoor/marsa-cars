import { useUser } from "@clerk/nextjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import AnimatedContainer from "../../animated-container";
import DefaultUserImg from "@/public/assets/images/default-user.jpg";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/store/ui/button";
import UserDetails from "./user-details";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanTier,
} from "@/constants/subscription-plans";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Step1({
  step,
  setStep,
  selectedPlan,
  onPlanSelect,
}: {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  selectedPlan: SubscriptionPlanTier | null;
  onPlanSelect: Dispatch<SetStateAction<SubscriptionPlanTier | null>>;
}) {
  const { isSignedIn } = useUser();
  const [user, setUser] = useState<boolean>(false);

  const handleNext = () => {
    if (!selectedPlan) {
      toast.error("Select a seller package to continue.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSignedIn) {
      setUser(isSignedIn);
    }
  }, [isSignedIn]);
  return (
    <div className="w-full">
      <AnimatedContainer>
        {isSignedIn && user ? (
          <div className="space-y-8">
            <UserDetails />
            <div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose your seller package
                </h3>
                <p className="text-sm text-gray-500">
                  Select the subscription tier that unlocks the right inventory
                  limits. You can upgrade or downgrade later.
                </p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.tier;
                  const Icon = plan.icon;
                  return (
                    <button
                      type="button"
                      key={plan.tier}
                      onClick={() => onPlanSelect(plan.tier)}
                      className={cn(
                        "relative w-full text-left rounded-2xl border bg-white p-4 shadow-sm transition-all",
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                      aria-pressed={isSelected}
                    >
                      {plan.popular && (
                        <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Most popular
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {plan.tier} Package
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {plan.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {plan.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full text-white",
                            `bg-gradient-to-br ${plan.color}`
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          R{plan.price}
                        </span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {plan.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        <li className="text-xs text-gray-400">
                          Tap a card to lock it in. Full details are on the
                          subscriptions page.
                        </li>
                      </ul>
                      {isSelected && (
                        <p className="mt-3 text-sm font-semibold text-blue-600">
                          Selected
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="h-full flex flex-col justify-center space-y-4">
              <div className="w-full bg-blue-100 border border-blue-200 text-sm text-blue-800 rounded-lg ">
                <div className="flex p-4">
                  Please sign in (Or sign up if you are new) to start
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={DefaultUserImg}
                  alt=""
                  width={200}
                  height={200}
                  className="w-40 h-40 object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col gap-y-3">
                <Link href="/sign-in">
                  <Button>Sign in</Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="pink">Sign up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </AnimatedContainer>
      {isSignedIn && (
        <div className="h-[100px] flex pt-4 px-2 justify-between">
          <button
            type="button"
            onClick={() => step > 1 && setStep((prev) => prev - 1)}
            className="h-10 py-2 px-4 rounded-lg shadow-sm text-gray-600 bg-white hover:bg-gray-100 font-medium border"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!selectedPlan}
            onClick={handleNext}
            className={cn(
              "h-10 py-2 px-4 rounded-lg shadow-sm text-white font-medium",
              selectedPlan
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
