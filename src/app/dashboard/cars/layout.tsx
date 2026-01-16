import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { Car, LayoutDashboard, MessageSquare, Settings, Sparkles } from "lucide-react";

export default async function CarsDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/cars" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Car Seller Dashboard</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard/cars"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </span>
              </Link>
              <Link
                href="/dashboard/cars/inquiries"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Inquiries
                </span>
              </Link>
              <Link
                href="/dashboard/cars/subscription"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Subscription
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/cars"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View Marketplace
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
