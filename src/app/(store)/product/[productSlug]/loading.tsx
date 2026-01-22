import { Skeleton } from "@/components/ui/skeleton";

export default function ProductEntryLoading() {
  return (
    <div className="md:max-w-[1650px] mx-auto p-4 md:p-8 min-h-[80vh]">
      <div className="w-full xl:flex xl:gap-4">
        {/* Gallery skeleton */}
        <div className="w-full xl:w-[calc(100%-950px)]">
          <Skeleton className="aspect-square w-full rounded-xl bg-gray-200 animate-pulse" />
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-md bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
          {/* Product Info Skeleton */}
          <div className="w-full xl:w-[540px] space-y-4">
            <Skeleton className="h-8 w-3/4 bg-gray-200 animate-pulse" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24 bg-gray-200 animate-pulse" />
              <Skeleton className="h-4 w-32 bg-gray-200 animate-pulse" />
            </div>
            <Skeleton className="h-10 w-40 bg-gray-200 animate-pulse" />
            <Skeleton className="h-20 w-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 bg-gray-200 animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 bg-gray-200 animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 rounded-md bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>
            {/* Add to Cart Button Skeleton */}
            <div className="pt-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-lg bg-gray-200 animate-pulse" />
              <Skeleton className="h-12 w-full rounded-lg bg-gray-200 animate-pulse" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="md:w-[390px] space-y-4">
            <Skeleton className="h-[400px] w-full rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-10 space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
              <Skeleton className="h-4 w-3/4 bg-gray-200 animate-pulse" />
              <Skeleton className="h-4 w-1/2 bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
