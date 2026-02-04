import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="md:max-w-[1650px] mx-auto p-4 md:p-8">
        <div className="w-full xl:flex xl:gap-8">
          {/* Left Column: Image Skeleton */}
          <div className="w-full xl:w-[500px] shrink-0">
            <div className="sticky top-4">
              <Skeleton className="w-full aspect-square rounded-2xl bg-gray-200" />
              <div className="grid grid-cols-5 gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg bg-gray-200" />
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Product Details Skeleton */}
          <div className="flex-1 mt-6 xl:mt-0 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24 rounded-full bg-gray-200" />
              <Skeleton className="h-8 w-3/4 rounded-lg bg-gray-200" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-32 rounded bg-gray-200" />
                <Skeleton className="h-6 w-24 rounded bg-gray-200" />
              </div>
              <Skeleton className="h-10 w-48 rounded-lg bg-gray-200" />
            </div>

            {/* Price & Variants */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32 rounded bg-gray-200" />
                <div className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-20 rounded-lg bg-gray-200" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-32 rounded bg-gray-200" />
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 round-full bg-gray-200" />
                  ))}
                </div>
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-40 rounded bg-gray-200" />
              <Skeleton className="h-4 w-full rounded bg-gray-200" />
              <Skeleton className="h-4 w-full rounded bg-gray-200" />
              <Skeleton className="h-4 w-2/3 rounded bg-gray-200" />
            </div>
          </div>

          {/* Right Column: Checkout/Shipping Skeleton */}
          <div className="w-full xl:w-[380px] shrink-0 mt-6 xl:mt-0">
            <div className="sticky top-4 space-y-4">
              <div className="p-6 bg-white rounded-xl border border-gray-100 space-y-4">
                <Skeleton className="h-6 w-1/2 rounded bg-gray-200" />
                <Skeleton className="h-20 w-full rounded-lg bg-gray-200" />
                <Skeleton className="h-12 w-full rounded-full bg-gray-200" />
                <Skeleton className="h-12 w-full rounded-full bg-gray-200" />
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded bg-gray-200" />
                    <Skeleton className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
