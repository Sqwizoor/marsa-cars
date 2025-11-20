import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative w-full">
      <div className="hidden md:block absolute top-0 right-0 w-10 h-full bg-slate-100/50"></div>
      <div className="relative w-full md:w-[calc(100%-40px)] h-full bg-[#e3e3e3]">
        <div className="max-w-[1600px] mx-auto min-h-screen p-4 space-y-4">
          {/* Main Grid Skeleton */}
          <div className="w-full grid gap-2 min-[1170px]:grid-cols-[1fr_350px] min-[1465px]:grid-cols-[200px_1fr_350px]">
             {/* Left Ad Skeleton */}
             <div className="hidden min-[1465px]:block h-[600px] w-full">
                <Skeleton className="h-full w-full rounded-md bg-gray-200" />
             </div>
             
             {/* Middle Swiper Skeleton */}
             <div className="space-y-2 h-fit w-full">
                <Skeleton className="h-[400px] w-full rounded-md bg-gray-200" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-[150px] w-full rounded-md bg-gray-200" />
                  <Skeleton className="h-[150px] w-full rounded-md bg-gray-200" />
                  <Skeleton className="h-[150px] w-full rounded-md bg-gray-200" />
                </div>
             </div>

             {/* Right User Card Skeleton */}
             <div className="h-full hidden min-[1170px]:block">
                <Skeleton className="h-[600px] w-full rounded-md bg-gray-200" />
             </div>
          </div>
          
          {/* Deals Skeleton */}
          <div className="mt-10 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-2xl bg-gray-200" />
              <Skeleton className="h-[300px] w-full rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
