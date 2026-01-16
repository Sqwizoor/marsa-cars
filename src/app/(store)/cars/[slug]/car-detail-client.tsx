"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
  User,
  Phone,
  Mail,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Eye,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { CarImage } from "@prisma/client";
import type { CarListingWithImages } from "@/queries/cars";

interface CarDetailClientProps {
  listing: CarListingWithImages & {
    carSubscription: {
      tier: string;
      sellerType: string;
      dealerName?: string | null;
      dealerLogo?: string | null;
      dealerPhone?: string | null;
      dealerAddress?: string | null;
    };
  };
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat("en-ZA").format(mileage) + " km";
};

export default function CarDetailClient({ listing }: CarDetailClientProps) {
  const { isSignedIn, user } = useUser();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: user?.fullName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phone: "",
    message: `Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`,
  });
  const [sending, setSending] = useState(false);

  const isDealer = listing.carSubscription?.sellerType === "DEALER";
  const dealerName = listing.carSubscription?.dealerName;
  const features = (listing.features as string[]) || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch(`/api/cars/${listing.id}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });

      if (!response.ok) {
        throw new Error("Failed to send inquiry");
      }

      toast.success("Inquiry sent successfully! The seller will contact you soon.");
      setShowInquiryForm(false);
    } catch (error) {
      toast.error("Failed to send inquiry. Please try again.");
    }

    setSending(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.year} ${listing.make} ${listing.model}`,
          text: `Check out this ${listing.year} ${listing.make} ${listing.model} for ${formatPrice(listing.price)}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/cars" className="hover:text-blue-600">
              Cars
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/cars?make=${listing.make}`} className="hover:text-blue-600">
              {listing.make}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-gray-100">
                {listing.images.length > 0 ? (
                  <Image
                    src={listing.images[currentImageIndex].url}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No images available
                  </div>
                )}

                {/* Navigation Arrows */}
                {listing.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {listing.isSponsored && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Sponsored
                    </Badge>
                  )}
                  {listing.condition === "NEW" && (
                    <Badge className="bg-green-500 text-white border-0">Brand New</Badge>
                  )}
                  {listing.condition === "CERTIFIED_PRE_OWNED" && (
                    <Badge className="bg-blue-500 text-white border-0">Certified</Badge>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((image: CarImage, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Year</div>
                      <div className="font-semibold">{listing.year}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Mileage</div>
                      <div className="font-semibold">{formatMileage(listing.mileage)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Fuel className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Fuel Type</div>
                      <div className="font-semibold capitalize">
                        {listing.fuelType.toLowerCase().replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">
                      {listing.transmission === "AUTOMATIC" ? "A" : "M"}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Transmission</div>
                      <div className="font-semibold capitalize">
                        {listing.transmission.toLowerCase().replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  {listing.bodyType && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">🚗</div>
                      <div>
                        <div className="text-xs text-gray-500">Body Type</div>
                        <div className="font-semibold">{listing.bodyType}</div>
                      </div>
                    </div>
                  )}
                  {listing.color && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">🎨</div>
                      <div>
                        <div className="text-xs text-gray-500">Color</div>
                        <div className="font-semibold">{listing.color}</div>
                      </div>
                    </div>
                  )}
                  {listing.engineSize && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">⚡</div>
                      <div>
                        <div className="text-xs text-gray-500">Engine</div>
                        <div className="font-semibold">{listing.engineSize}</div>
                      </div>
                    </div>
                  )}
                  {listing.drivetrain && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">⚙️</div>
                      <div>
                        <div className="text-xs text-gray-500">Drivetrain</div>
                        <div className="font-semibold">{listing.drivetrain}</div>
                      </div>
                    </div>
                  )}
                  {listing.doors && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">🚪</div>
                      <div>
                        <div className="text-xs text-gray-500">Doors</div>
                        <div className="font-semibold">{listing.doors}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {listing.year} {listing.make} {listing.model}
                </h1>
                {listing.variant && (
                  <p className="text-gray-500 mb-4">{listing.variant}</p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600">
                    {formatPrice(listing.price)}
                  </div>
                  {listing.priceNegotiable && (
                    <Badge variant="secondary" className="mt-2">
                      Price Negotiable
                    </Badge>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Location */}
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {listing.city}, {listing.province}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Listed{" "}
                    {new Date(listing.createdAt).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {isDealer && listing.carSubscription.dealerLogo ? (
                      <Image
                        src={listing.carSubscription.dealerLogo}
                        alt={dealerName || "Dealer"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        src={listing.user.picture}
                        alt={listing.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-semibold">
                        {isDealer && dealerName ? dealerName : listing.user.name}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {isDealer ? (
                          <>
                            <Building2 className="w-4 h-4" />
                            <span>Verified Dealer</span>
                            <Shield className="w-4 h-4 text-green-500 ml-1" />
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Private Seller</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Send Inquiry
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact Seller</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInquiry} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Your Name</Label>
                          <Input
                            value={inquiryForm.name}
                            onChange={(e) =>
                              setInquiryForm({ ...inquiryForm, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={inquiryForm.email}
                            onChange={(e) =>
                              setInquiryForm({ ...inquiryForm, email: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone (optional)</Label>
                          <Input
                            type="tel"
                            value={inquiryForm.phone}
                            onChange={(e) =>
                              setInquiryForm({ ...inquiryForm, phone: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            value={inquiryForm.message}
                            onChange={(e) =>
                              setInquiryForm({ ...inquiryForm, message: e.target.value })
                            }
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={sending}>
                          {sending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {listing.carSubscription.dealerPhone && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      asChild
                    >
                      <a href={`tel:${listing.carSubscription.dealerPhone}`}>
                        <Phone className="w-5 h-5 mr-2" />
                        Call Dealer
                      </a>
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1">
                      <Heart className="w-5 h-5 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
