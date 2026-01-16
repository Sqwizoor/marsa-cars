import { Metadata } from "next";
import { Suspense } from "react";
import CarsPageClient from "./cars-page-client";

export const metadata: Metadata = {
  title: "Cars for Sale | Find Your Perfect Vehicle",
  description: "Browse thousands of new and used cars for sale. Find your perfect vehicle from private sellers and verified dealerships.",
};

export default function CarsPage() {
  return (
    <Suspense fallback={<CarsPageSkeleton />}>
      <CarsPageClient />
    </Suspense>
  );
}

function CarsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 w-64 bg-white/20 rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-96 bg-white/20 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
