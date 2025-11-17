import { Skeleton } from "@/components/ui/skeleton";

export default function ProductVariantLoading() {
  return (
    <div className="md:max-w-[1650px] mx-auto p-8 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-[420px] w-full" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>

        {/* Summary panel skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Below-the-fold sections */}
      <div className="mt-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
