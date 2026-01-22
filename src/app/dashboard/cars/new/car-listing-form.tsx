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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAR_MAKES,
  CAR_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CAR_CONDITIONS,
  SA_PROVINCES,
  CAR_FEATURES,
} from "@/constants/car-subscription-plans";
import { 
  Check, 
  Car, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  PartyPopper,
  AlertCircle,
  Camera,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { CarSubscription } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface CarListingFormProps {
  subscription: CarSubscription;
  canCreate: boolean;
}

type Step = "details" | "images" | "review" | "success";

export default function CarListingForm({ subscription, canCreate }: CarListingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSponsored, setIsSponsored] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    make: "",
    model: "",
    year: "",
    variant: "",
    price: "",
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

    Array.from(files).forEach((file) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          if (!ctx) return;

          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImages((prev) => [...prev, optimizedDataUrl]);
        };
      };
      
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitListing = async () => {
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
          isSponsored: isSponsored,
          images: images.map((url, index) => ({ url, isPrimary: index === 0 })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      toast.success("Car listing created successfully!");
      setCurrentStep("success");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const steps = [
    { id: "details", label: "Car Details", icon: FileText },
    { id: "images", label: "Photos", icon: Camera },
    { id: "review", label: "Review", icon: Check },
    { id: "success", label: "Done", icon: PartyPopper },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const canSponsor = subscription.sponsoredUsed < subscription.sponsoredLimit;

  // If user can't create, show upgrade message
  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Listing Limit Reached
                </h3>
                <p className="text-amber-700 mb-4">
                  You&apos;ve used all your available listing slots. Upgrade your plan to list more vehicles.
                </p>
                <div className="flex gap-3">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/dashboard/cars/subscription">Upgrade Plan</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/cars">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Car Listing</h1>
        <p className="text-gray-600">
          Fill in your vehicle details to list it for sale
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                  index < currentStepIndex
                    ? "bg-green-500 border-green-500 text-white"
                    : index === currentStepIndex
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500 text-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
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
                  className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "details" && (
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-pink-500" />
              Vehicle Information
            </CardTitle>
            <CardDescription>
              Provide accurate details about your car
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Listing Title *</Label>
              <Input
                placeholder="e.g., 2020 Toyota Corolla 1.8 XS Auto"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="h-12"
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
                  <SelectTrigger className="h-12">
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
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Year *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(v) => handleInputChange("year", v)}
                >
                  <SelectTrigger className="h-12">
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

            {/* Variant and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Variant / Trim</Label>
                <Input
                  placeholder="e.g., 1.8 XS CVT"
                  value={formData.variant}
                  onChange={(e) => handleInputChange("variant", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (ZAR) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 350000"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="h-12"
                />
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
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Fuel Type *</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(v) => handleInputChange("fuelType", v)}
                >
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  className="h-12"
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
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Drivetrain</Label>
                <Select
                  value={formData.drivetrain}
                  onValueChange={(v) => handleInputChange("drivetrain", v)}
                >
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  <SelectTrigger className="h-12">
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
                  className="h-12"
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
                className="resize-none"
              />
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Label>Features & Equipment</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/dashboard/cars">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Link>
              </Button>
              <Button 
                onClick={() => setCurrentStep("images")}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "images" && (
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-500" />
              Upload Photos
            </CardTitle>
            <CardDescription>
              Add high-quality photos to attract more buyers (up to 10 images)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
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
                <Button variant="outline" asChild className="cursor-pointer">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Images
                  </span>
                </Button>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border">
                    <Image
                      src={image}
                      alt={`Car image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500">
                        Main Photo
                      </Badge>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Alert>
              <Camera className="w-4 h-4" />
              <AlertDescription>
                <strong>Tip:</strong> Include photos of the exterior, interior, dashboard, engine, and any special features or flaws.
              </AlertDescription>
            </Alert>

            {/* Sponsor Option */}
            {canSponsor && (
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 mb-1">Boost Your Listing</h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Sponsored listings appear at the top and get 5x more views!
                        You have {subscription.sponsoredLimit - subscription.sponsoredUsed} sponsored slots remaining.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sponsor"
                          checked={isSponsored}
                          onCheckedChange={(checked) => setIsSponsored(checked as boolean)}
                        />
                        <label htmlFor="sponsor" className="text-sm font-medium cursor-pointer">
                          Make this a sponsored listing
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentStep("details")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep("review")}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Review Listing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Review Your Listing
            </CardTitle>
            <CardDescription>
              Make sure everything looks good before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Preview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Images */}
              <div>
                {images.length > 0 && (
                  <div className="aspect-video relative rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={images[0]}
                      alt="Main car image"
                      fill
                      className="object-cover"
                    />
                    {isSponsored && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{formData.title || "Your Listing"}</h2>
                <p className="text-3xl font-bold text-pink-600">
                  R{parseInt(formData.price || "0").toLocaleString()}
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Year:</span>
                    <span className="font-medium">{formData.year}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Mileage:</span>
                    <span className="font-medium">{parseInt(formData.mileage || "0").toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Transmission:</span>
                    <span className="font-medium">{formData.transmission}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Fuel Type:</span>
                    <span className="font-medium">{formData.fuelType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{formData.city}, {formData.province}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-medium">{formData.condition}</span>
                  </div>
                </div>

                {selectedFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedFeatures.slice(0, 6).map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                    ))}
                    {selectedFeatures.length > 6 && (
                      <Badge variant="outline" className="text-xs">+{selectedFeatures.length - 6} more</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentStep("images")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmitListing}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
              >
                {loading ? "Creating..." : "Publish Listing"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "success" && (
        <Card className="shadow-lg border-green-200 bg-gradient-to-b from-green-50 to-white">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Listing Created Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your car is now pending review. Once approved, it will be visible to thousands of potential buyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-500">
                <Link href="/dashboard/cars">
                  View My Listings
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/cars/new">
                  Create Another Listing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
