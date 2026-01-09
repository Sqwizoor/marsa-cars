import type { LucideIcon } from "lucide-react";
import { Crown, TrendingUp, Zap } from "lucide-react";

export type SubscriptionPlanTier = "BRONZE" | "SILVER" | "GOLD";

export type SubscriptionPlan = {
  tier: SubscriptionPlanTier;
  name: string;
  price: number;
  description: string;
  adLimit: number;
  icon: LucideIcon;
  color: string;
  features: string[];
  popular?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "BRONZE",
    name: "Bronze",
    price: 499,
    description: "Perfect for getting started",
    adLimit: 100,
    icon: Zap,
    color: "from-orange-400 to-orange-600",
    features: [
      "100 active ads per month",
      "Basic analytics",
      "Email support",
      "Standard ad placement",
      "Monthly billing",
    ],
  },
  {
    tier: "SILVER",
    name: "Silver",
    price: 699,
    description: "Great for growing businesses",
    adLimit: 250,
    icon: TrendingUp,
    color: "from-gray-400 to-gray-600",
    popular: true,
    features: [
      "250 active ads per month",
      "Advanced analytics",
      "Priority email support",
      "Premium ad placement",
      "Monthly billing",
      "Featured badge",
    ],
  },
  {
    tier: "GOLD",
    name: "Gold",
    price: 1399,
    description: "For unlimited growth",
    adLimit: -1,
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    features: [
      "Unlimited active ads",
      "Real-time analytics",
      "24/7 priority support",
      "Top ad placement",
      "Monthly billing",
      "Featured badge",
      "Custom targeting",
    ],
  },
];

export const isValidSubscriptionTier = (
  value: string | null
): value is SubscriptionPlanTier => {
  if (!value) return false;
  return SUBSCRIPTION_PLANS.some((plan) => plan.tier === value);
};

export const getSubscriptionPlanByTier = (
  tier: SubscriptionPlanTier | null
) => {
  if (!tier) return undefined;
  return SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier);
};
  