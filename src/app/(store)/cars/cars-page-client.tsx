"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CarCard } from "@/components/store/cards/car";
import SponsoredCarsSection from "@/components/store/cars/sponsored-cars-section";
import CarFilters from "@/components/store/cars/car-filters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  Car,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { CarListingWithImages } from "@/queries/cars";

export default function CarsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const page = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sortBy") || "newest";

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/cars?${params.toString()}`);
      const data = await response.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`/cars?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateParams("model", searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/images/car-pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Car
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Browse thousands of vehicles from private sellers and verified dealerships
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by make or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl bg-white/95 border-0 shadow-lg"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-xl bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg"
              >
                Search
              </Button>
            </form>

            {/* Quick Stats */}
            <div className="mt-8 flex justify-center gap-8 text-white/80">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{total}+</div>
                <div className="text-sm">Available Cars</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-sm">Verified Dealers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">9</div>
                <div className="text-sm">Provinces</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsored Cars Section */}
      <SponsoredCarsSection />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Cars</h2>
            <p className="text-gray-500">
              {total} vehicles found
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={(v) => updateParams("sortBy", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="year-new">Year: Newest</SelectItem>
                <SelectItem value="year-old">Year: Oldest</SelectItem>
                <SelectItem value="mileage-low">Mileage: Lowest</SelectItem>
                <SelectItem value="views">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/cars/sell">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Car className="w-4 h-4 mr-2" />
                Sell Your Car
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <CarFilters
            onClose={() => setShowFilters(false)}
            onApply={() => setShowFilters(false)}
          />
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No cars found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <Button onClick={() => router.push("/cars")}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => updateParams("page", String(page - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams("page", String(pageNum))}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => updateParams("page", String(page + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
