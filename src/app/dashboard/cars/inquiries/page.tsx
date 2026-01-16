import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Car, Mail, Phone, Clock, Check, ArrowLeft } from "lucide-react";
import InquiriesClient from "./inquiries-client";

export const metadata: Metadata = {
  title: "Inquiries | Car Dashboard",
  description: "Manage inquiries from potential buyers",
};

export default async function InquiriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const inquiries = await db.carInquiry.findMany({
    where: {
      carListing: { userId },
    },
    include: {
      carListing: {
        select: {
          id: true,
          title: true,
          slug: true,
          make: true,
          model: true,
          year: true,
          images: { take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = inquiries.filter((i) => !i.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cars">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Inquiries</h1>
            <p className="text-gray-500">
              {inquiries.length} total • {unreadCount} unread
            </p>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No inquiries yet
            </h3>
            <p className="text-gray-500">
              When buyers contact you about your listings, their messages will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <InquiriesClient inquiries={inquiries as any} />
      )}
    </div>
  );
}
