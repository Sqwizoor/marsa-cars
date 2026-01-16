import type { LucideIcon } from "lucide-react";
import { Car, Crown, User } from "lucide-react";

export type CarSubscriptionTier = "INDIVIDUAL" | "PREMIUM" | "DEALER";
export type CarSellerType = "INDIVIDUAL" | "DEALER";

export type CarSubscriptionPlan = {
  tier: CarSubscriptionTier;
  name: string;
  price: number;
  description: string;
  listingLimit: number;
  sponsoredLimit: number;
  icon: LucideIcon;
  color: string;
  gradient: string;
  features: string[];
  popular?: boolean;
  sellerType: CarSellerType;
};

export const CAR_SUBSCRIPTION_PLANS: CarSubscriptionPlan[] = [
  {
    tier: "INDIVIDUAL",
    name: "Individual",
    price: 0,
    description: "Perfect for private sellers",
    listingLimit: 1,
    sponsoredLimit: 2,
    icon: User,
    color: "text-blue-600",
    gradient: "from-blue-400 to-blue-600",
    sellerType: "INDIVIDUAL",
    features: [
      "1 active car listing",
      "Up to 2 sponsored ads",
      "Basic listing features",
      "Email notifications",
      "Standard visibility",
      "Free forever",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium Seller",
    price: 599,
    description: "For serious sellers",
    listingLimit: 20,
    sponsoredLimit: 5,
    icon: Car,
    color: "text-purple-600",
    gradient: "from-purple-400 to-purple-600",
    sellerType: "INDIVIDUAL",
    popular: true,
    features: [
      "20 active car listings",
      "Up to 5 sponsored ads",
      "Priority listing placement",
      "Advanced analytics",
      "Priority support",
      "Featured seller badge",
      "Social media promotion",
    ],
  },
  {
    tier: "DEALER",
    name: "Dealer Pro",
    price: 1499,
    description: "For dealerships & businesses",
    listingLimit: -1, // Unlimited
    sponsoredLimit: 10,
    icon: Crown,
    color: "text-amber-600",
    gradient: "from-amber-400 to-amber-600",
    sellerType: "DEALER",
    features: [
      "Unlimited car listings",
      "Up to 10 sponsored ads",
      "Top search placement",
      "Dealer verification badge",
      "Real-time analytics dashboard",
      "24/7 priority support",
      "Dedicated account manager",
      "Custom dealer storefront",
      "Bulk import tools",
      "API access",
    ],
  },
];

export const isValidCarSubscriptionTier = (
  value: string | null
): value is CarSubscriptionTier => {
  if (!value) return false;
  return CAR_SUBSCRIPTION_PLANS.some((plan) => plan.tier === value);
};

export const getCarSubscriptionPlanByTier = (
  tier: CarSubscriptionTier | null
) => {
  if (!tier) return undefined;
  return CAR_SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier);
};

export const getListingLimitDisplay = (limit: number): string => {
  return limit === -1 ? "Unlimited" : `${limit}`;
};

// Car makes for dropdown selection
export const CAR_MAKES = [
  "Audi",
  "BMW",
  "Chevrolet",
  "Datsun",
  "Fiat",
  "Ford",
  "GWM",
  "Haval",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mahindra",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Subaru",
  "Suzuki",
  "Tata",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Other",
] as const;

export const CAR_BODY_TYPES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Crossover",
  "Bakkie",
  "Double Cab",
  "Single Cab",
  "Coupe",
  "Convertible",
  "Wagon",
  "MPV",
  "Van",
  "Sports Car",
  "Other",
] as const;

export const FUEL_TYPES = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "PLUGIN_HYBRID", label: "Plug-in Hybrid" },
  { value: "LPG", label: "LPG" },
  { value: "OTHER", label: "Other" },
] as const;

export const TRANSMISSION_TYPES = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "SEMI_AUTOMATIC", label: "Semi-Automatic" },
  { value: "CVT", label: "CVT" },
] as const;

export const CAR_CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "CERTIFIED_PRE_OWNED", label: "Certified Pre-Owned" },
] as const;

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

// Common car features for selection
export const CAR_FEATURES = [
  // Safety
  "ABS",
  "Airbags",
  "ISOFIX",
  "Traction Control",
  "Stability Control",
  "Reverse Camera",
  "Parking Sensors",
  "Blind Spot Monitor",
  "Lane Departure Warning",
  "Collision Warning",
  // Comfort
  "Air Conditioning",
  "Climate Control",
  "Heated Seats",
  "Cooled Seats",
  "Leather Seats",
  "Electric Seats",
  "Sunroof",
  "Panoramic Roof",
  "Keyless Entry",
  "Push Start",
  "Cruise Control",
  "Adaptive Cruise Control",
  // Technology
  "Bluetooth",
  "Apple CarPlay",
  "Android Auto",
  "Navigation System",
  "Touchscreen Display",
  "USB Ports",
  "Wireless Charging",
  "Premium Sound System",
  "360° Camera",
  "Head-Up Display",
  // Exterior
  "Alloy Wheels",
  "LED Headlights",
  "Xenon Headlights",
  "Fog Lights",
  "Roof Rails",
  "Tow Bar",
  "Electric Mirrors",
  "Rain Sensing Wipers",
] as const;

export type CarMake = (typeof CAR_MAKES)[number];
export type CarBodyType = (typeof CAR_BODY_TYPES)[number];
export type FuelType = (typeof FUEL_TYPES)[number]["value"];
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number]["value"];
export type CarCondition = (typeof CAR_CONDITIONS)[number]["value"];
export type Province = (typeof SA_PROVINCES)[number];
