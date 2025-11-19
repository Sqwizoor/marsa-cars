import { Skeleton } from "@/components/ui/skeleton";

export default function ProductEntryLoading() {
  return (
    <div className="md:max-w-[1650px] mx-auto p-8 min-h-screen">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[420px]" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
