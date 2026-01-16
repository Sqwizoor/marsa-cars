"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Clock, Check, ExternalLink, Car } from "lucide-react";
import toast from "react-hot-toast";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
  carListing: {
    id: string;
    title: string;
    slug: string;
    make: string;
    model: string;
    year: number;
    images: { url: string }[];
  };
}

interface InquiriesClientProps {
  inquiries: Inquiry[];
}

export default function InquiriesClient({ inquiries: initialInquiries }: InquiriesClientProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/cars/inquiries/${id}/read`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, isRead: true } : inq
        )
      );
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-ZA");
  };

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card
          key={inquiry.id}
          className={`transition-all ${
            !inquiry.isRead
              ? "border-blue-200 bg-blue-50/30"
              : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Car Info */}
              <div className="flex items-center gap-4 md:w-64 flex-shrink-0">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100">
                  {inquiry.carListing.images[0] ? (
                    <Image
                      src={inquiry.carListing.images[0].url}
                      alt={inquiry.carListing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/cars/${inquiry.carListing.slug}`}
                    className="font-medium hover:text-blue-600 line-clamp-1"
                  >
                    {inquiry.carListing.year} {inquiry.carListing.make}{" "}
                    {inquiry.carListing.model}
                  </Link>
                  <Link
                    href={`/cars/${inquiry.carListing.slug}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    View listing <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Inquiry Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{inquiry.name}</span>
                      {!inquiry.isRead && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </a>
                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Phone className="w-3 h-3" />
                          {inquiry.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(inquiry.createdAt)}
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-3">
                  {inquiry.message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <Button size="sm" asChild>
                    <a href={`mailto:${inquiry.email}?subject=Re: ${inquiry.carListing.year} ${inquiry.carListing.make} ${inquiry.carListing.model}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Reply
                    </a>
                  </Button>
                  {inquiry.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${inquiry.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                  {!inquiry.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(inquiry.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
