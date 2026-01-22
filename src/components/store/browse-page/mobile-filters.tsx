"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { FiltersQueryType } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

interface MobileFiltersProps {
  queries: FiltersQueryType;
}

export default function MobileFilters({ queries }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Count active filters
  const activeFiltersCount = [
    queries.category,
    queries.subCategory,
    queries.offer,
    queries.size,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("subCategory");
    params.delete("offer");
    params.delete("size");
    router.push(`/browse?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 flex-1"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-pink-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-pink-600 hover:text-pink-700"
                >
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="py-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Filter sections will be loaded via client-side */}
            <MobileFilterContent queries={queries} onClose={() => setOpen(false)} />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              onClick={() => setOpen(false)}
            >
              Show Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick filter chips */}
      {queries.category && (
        <Badge 
          variant="secondary" 
          className="bg-pink-100 text-pink-700 flex items-center gap-1 cursor-pointer hover:bg-pink-200"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("category");
            params.delete("subCategory");
            router.push(`/browse?${params.toString()}`);
          }}
        >
          {queries.category}
          <X className="w-3 h-3" />
        </Badge>
      )}
    </div>
  );
}

// Client component for filter content
function MobileFilterContent({ 
  queries, 
  onClose 
}: { 
  queries: FiltersQueryType; 
  onClose: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and offers on mount
  useState(() => {
    async function fetchData() {
      try {
        const [catRes, offerRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/offers"),
        ]);
        
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
        
        if (offerRes.ok) {
          const offerData = await offerRes.json();
          setOffers(offerData.offers || []);
        }
      } catch (error) {
        console.error("Failed to fetch filter data", error);
      }
      setLoading(false);
    }
    fetchData();
  });

  const handleCategoryClick = (categoryUrl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queries.category === categoryUrl) {
      params.delete("category");
      params.delete("subCategory");
    } else {
      params.set("category", categoryUrl);
      params.delete("subCategory");
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleSubCategoryClick = (subCategoryUrl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queries.subCategory === subCategoryUrl) {
      params.delete("subCategory");
    } else {
      params.set("subCategory", subCategoryUrl);
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleOfferClick = (offerUrl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queries.offer === offerUrl) {
      params.delete("offer");
    } else {
      params.set("offer", offerUrl);
    }
    router.push(`/browse?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.url)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                queries.category === cat.url
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories (if category selected) */}
      {queries.category && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Subcategories</h3>
          <div className="flex flex-wrap gap-2">
            {categories
              .find((c) => c.url === queries.category)
              ?.subCategories?.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubCategoryClick(sub.url)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    queries.subCategory === sub.url
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Special Offers</h3>
          <div className="flex flex-wrap gap-2">
            {offers.map((offer) => (
              <button
                key={offer.id}
                onClick={() => handleOfferClick(offer.url)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  queries.offer === offer.url
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {offer.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
