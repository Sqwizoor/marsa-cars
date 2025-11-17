"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string | null;
  url: string | null;
  user: {
    name: string;
    subscriptions: { tier: string }[];
  };
}

interface AdBannerProps {
  category?: string;
  limit?: number;
  className?: string;
}

export default function AdBanner({
  category,
  limit = 1,
  className = "",
}: AdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAds();
  }, [category, limit]);

  useEffect(() => {
    // Track view when ad is displayed
    if (ads.length > 0 && ads[currentIndex]) {
      trackView(ads[currentIndex].id);
    }
  }, [currentIndex, ads]);

  useEffect(() => {
    // Rotate ads every 10 seconds
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchAds = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      params.append("limit", limit.toString());

      const response = await fetch(`/api/advertisements/active?${params}`);
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const trackView = async (adId: string) => {
    try {
      await fetch(`/api/advertisements/${adId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view" }),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await fetch(`/api/advertisements/${adId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click" }),
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const handleAdClick = (ad: Advertisement) => {
    trackClick(ad.id);
    if (ad.url) {
      window.open(ad.url, "_blank");
    }
  };

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];
  const tier = currentAd.user.subscriptions[0]?.tier || "BRONZE";

  const tierColors = {
    BRONZE: "from-orange-400/20 to-orange-600/20 border-orange-400",
    SILVER: "from-gray-400/20 to-gray-600/20 border-gray-400",
    GOLD: "from-yellow-400/20 to-yellow-600/20 border-yellow-400",
  };

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${className}`}
      onClick={() => handleAdClick(currentAd)}
    >
      <div
        className={`bg-gradient-to-br ${
          tierColors[tier as keyof typeof tierColors]
        } border-l-4 p-4 md:p-6`}
      >
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Sponsored
          </Badge>
          {ads.length > 1 && (
            <div className="flex gap-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-4"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {currentAd.image && (
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 line-clamp-1">
              {currentAd.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {currentAd.description}
            </p>
            {currentAd.url && (
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <span>Learn More</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
