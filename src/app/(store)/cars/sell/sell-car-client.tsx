"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAR_SUBSCRIPTION_PLANS,
  CAR_MAKES,
  CAR_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CAR_CONDITIONS,
  SA_PROVINCES,
  CAR_FEATURES,
  getListingLimitDisplay,
} from "@/constants/car-subscription-plans";
import { Check, Car, Upload, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { CarSubscription } from "@prisma/client";
import Image from "next/image";

interface SellCarClientProps {
  initialSubscription: CarSubscription | null;
}

type Step = "plan" | "details" | "images" | "review";

export default function SellCarClient({ initialSubscription }: SellCarClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(initialSubscription ? "details" : "plan");
  const [subscription, setSubscription] = useState<CarSubscription | null>(initialSubscription);
  const [selectedPlan, setSelectedPlan] = useState<string>("INDIVIDUAL");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    make: "",
    model: "",
    year: "",
    variant: "",
    price: "",
    priceNegotiable: false,
    mileage: "",
    fuelType: "",
    transmission: "",
    condition: "",
    bodyType: "",
    color: "",
    engineSize: "",
    drivetrain: "",
    doors: "",
    seats: "",
    province: "",
    city: "",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, we'll use placeholder URLs - in production, upload to Cloudinary
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectPlan = async () => {
    if (subscription) {
      setCurrentStep("details");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cars/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan,
          sellerType: selectedPlan === "DEALER" ? "DEALER" : "INDIVIDUAL",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      setSubscription(data.subscription);

      // For free tier, go directly to details
      if (selectedPlan === "INDIVIDUAL") {
        setCurrentStep("details");
      } else {
        // For paid tiers, redirect to payment
        router.push(`/dashboard/cars/subscription/payment?tier=${selectedPlan}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleSubmitListing = async () => {
    // Validate required fields
    if (!formData.title || !formData.make || !formData.model || !formData.year ||
        !formData.price || !formData.mileage || !formData.fuelType ||
        !formData.transmission || !formData.condition || !formData.province ||
        !formData.city || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cars/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: selectedFeatures,
          images: images.map((url, index) => ({ url, isPrimary: index === 0 })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      toast.success("Car listing created successfully!");
      router.push("/dashboard/cars");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const steps = [
    { id: "plan", label: "Choose Plan" },
    { id: "details", label: "Car Details" },
    { id: "images", label: "Photos" },
    { id: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Car</h1>
          <p className="text-gray-600">
            List your vehicle and reach thousands of potential buyers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all ${
                    index < currentStepIndex
                      ? "bg-green-500 border-green-500 text-white"
                      : index === currentStepIndex
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    index <= currentStepIndex ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "plan" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {CAR_SUBSCRIPTION_PLANS.map((plan) => (
                <Card
                  key={plan.tier}
                  className={`cursor-pointer transition-all hover:shadow-lg relative ${
                    selectedPlan === plan.tier
                      ? "ring-2 ring-blue-600 border-blue-600"
                      : ""
                  } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                  onClick={() => setSelectedPlan(plan.tier)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}
                    >
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? "FREE" : `R${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span>
                          <strong>{getListingLimitDisplay(plan.listingLimit)}</strong>{" "}
                          car listing{plan.listingLimit !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>
                          <strong>{plan.sponsoredLimit}</strong> sponsored ads
                        </span>
                      </div>
                      <hr className="my-4" />
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full mt-6 ${
                        selectedPlan === plan.tier
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : ""
                      }`}
                      variant={selectedPlan === plan.tier ? "default" : "outline"}
                    >
                      {selectedPlan === plan.tier ? "Selected" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleSelectPlan}
                disabled={loading}
                className="px-12"
              >
                {loading ? "Processing..." : "Continue"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Provide accurate information about your vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label>Listing Title *</Label>
                <Input
                  placeholder="e.g., 2020 Toyota Corolla 1.8 XS Auto"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              {/* Make, Model, Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Make *</Label>
                  <Select
                    value={formData.make}
                    onValueChange={(v) => handleInputChange("make", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_MAKES.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model *</Label>
                  <Input
                    placeholder="e.g., Corolla"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(v) => handleInputChange("year", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variant */}
              <div className="space-y-2">
                <Label>Variant / Trim</Label>
                <Input
                  placeholder="e.g., 1.8 XS CVT"
                  value={formData.variant}
                  onChange={(e) => handleInputChange("variant", e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (ZAR) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 350000"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={formData.priceNegotiable}
                      onCheckedChange={(checked) =>
                        handleInputChange("priceNegotiable", !!checked)
                      }
                    />
                    <label htmlFor="negotiable" className="text-sm">
                      Price is negotiable
                    </label>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mileage (km) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 45000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fuel Type *</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(v) => handleInputChange("fuelType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((fuel) => (
                        <SelectItem key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(v) => handleInputChange("transmission", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSMISSION_TYPES.map((trans) => (
                        <SelectItem key={trans.value} value={trans.value}>
                          {trans.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) => handleInputChange("condition", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_CONDITIONS.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select
                    value={formData.bodyType}
                    onValueChange={(v) => handleInputChange("bodyType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_BODY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    placeholder="e.g., White"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Engine Size</Label>
                  <Input
                    placeholder="e.g., 2.0L"
                    value={formData.engineSize}
                    onChange={(e) => handleInputChange("engineSize", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Drivetrain</Label>
                  <Select
                    value={formData.drivetrain}
                    onValueChange={(v) => handleInputChange("drivetrain", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FWD">FWD</SelectItem>
                      <SelectItem value="RWD">RWD</SelectItem>
                      <SelectItem value="AWD">AWD</SelectItem>
                      <SelectItem value="4WD">4WD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Doors</Label>
                  <Select
                    value={formData.doors}
                    onValueChange={(v) => handleInputChange("doors", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Select
                    value={formData.seats}
                    onValueChange={(v) => handleInputChange("seats", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 5, 6, 7, 8, 9].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Province *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(v) => handleInputChange("province", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((prov) => (
                        <SelectItem key={prov} value={prov}>
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="e.g., Johannesburg"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your car's condition, history, and any unique features..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={5}
                />
              </div>

              {/* Features */}
              <div className="space-y-4">
                <Label>Features & Equipment</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CAR_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={selectedFeatures.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <label htmlFor={feature} className="text-sm cursor-pointer">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("plan")}
                  disabled={!!initialSubscription}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("images")}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "images" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
              <CardDescription>
                Add high-quality photos to attract more buyers (up to 10 images)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop images here, or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" asChild>
                    <span>Select Images</span>
                  </Button>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={image}
                        alt={`Car image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          Main Photo
                        </Badge>
                      )}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Tip: Include photos of the exterior, interior, dashboard, engine, and any special features or flaws.
              </p>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep("details")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("review")}>
                  Review Listing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Listing</CardTitle>
              <CardDescription>
                Make sure everything looks correct before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="aspect-[16/10] relative rounded-lg overflow-hidden">
                      <Image
                        src={images[0]}
                        alt="Main preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {formData.year} {formData.make} {formData.model}
                    </h3>
                    {formData.variant && (
                      <p className="text-gray-500 mb-4">{formData.variant}</p>
                    )}
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      R{Number(formData.price).toLocaleString()}
                      {formData.priceNegotiable && (
                        <Badge variant="secondary" className="ml-2">
                          Negotiable
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Mileage:</span>{" "}
                        <strong>{Number(formData.mileage).toLocaleString()} km</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Fuel:</span>{" "}
                        <strong className="capitalize">
                          {formData.fuelType.toLowerCase().replace("_", " ")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Transmission:</span>{" "}
                        <strong className="capitalize">
                          {formData.transmission.toLowerCase().replace("_", " ")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Condition:</span>{" "}
                        <strong className="capitalize">
                          {formData.condition.toLowerCase().replace("_", " ")}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Location:</span>{" "}
                        <strong>
                          {formData.city}, {formData.province}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                {/* Features Preview */}
                {selectedFeatures.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeatures.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep("images")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmitListing}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Publishing..." : "Publish Listing"}
                  <Car className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
