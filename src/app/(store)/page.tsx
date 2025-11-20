import AnimatedDeals from "@/components/store/home/animated-deals";
import Featured from "@/components/store/home/main/featured";
import HomeMainSwiper from "@/components/store/home/main/home-swiper";
import HomeUserCard from "@/components/store/home/main/user/user";
import Sideline from "@/components/store/home/sideline/sideline";
import MainSwiper from "@/components/store/shared/swiper";
import { SimpleProduct } from "@/lib/types";
import { getHomeDataDynamic, getHomeFeaturedCategories } from "@/queries/home";
import { getProducts } from "@/queries/product";
import Image from "next/image";
import FeaturedCategories from "@/components/store/home/featured-categories";
import ProductCard from "@/components/store/cards/product/product-card";
import { ArrowRight, Flame, Star } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const productsData = await getProducts({}, "", 1, 100);
  const { products } = productsData;

  const {
    products_super_deals,
    products_best_deals,
    products_user_card,
    products_featured,
  } = await getHomeDataDynamic([
    { property: "offer", value: "best-deals", type: "simple" },
    { property: "offer", value: "super-deals", type: "full" },
    { property: "offer", value: "user-card", type: "simple" },
    { property: "offer", value: "featured", type: "simple" },
  ]);

 



  const featuredCategories = await getHomeFeaturedCategories();
  return (
    <>
      <div className="relative w-full">
        <div className="hidden md:block">
          <Sideline />
        </div>
        <div className="relative w-full md:w-[calc(100%-40px)] h-full bg-[#e3e3e3]">
          <div className="max-w-[1600px] mx-auto min-h-screen p-4">
            {/* Main */}
            <div className="w-full grid gap-2 min-[1170px]:grid-cols-[1fr_350px] min-[1465px]:grid-cols-[200px_1fr_350px]">
              {/* Left */}
              <div
                className="cursor-pointer hidden min-[1465px]:block bg-cover bg-center bg-no-repeat rounded-md h-[600px] w-full"
                style={{
                  backgroundImage:
                    "url(/assets/images/ads/image.png)",
                }}
              />
              {/* Middle */}
              <div className="space-y-2 h-fit">
                {/* Main swiper */}
                <HomeMainSwiper />
                {/* Featured card */}
             <Featured
                  products={products_featured.filter(
                    (product): product is SimpleProduct =>
                      "variantSlug" in product
                  )}
                /> 
              </div>
              {/* Right */}
              <div className="h-full">
                <HomeUserCard
                  products={products_user_card.filter(
                    (product): product is SimpleProduct =>
                      "variantSlug" in product
                  )}
                />
              </div>
            </div>
            {/* Animated deals */}
            <div className="mt-2 hidden min-[915px]:block">
              <AnimatedDeals
                products={products_best_deals.filter(
                  (product): product is SimpleProduct =>
                    "variantSlug" in product
                )}
              />
            </div>
            <div className="mt-10 space-y-6">
              {/* Super Deals Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">Limited Time Offer</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter drop-shadow-sm">Super Deals</h2>
                      <p className="text-white/90 text-base font-medium mt-2 max-w-md">Save up to 90% on premium auto parts. Don't miss out on these exclusive offers.</p>
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ends in:</span>
                      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-inner">
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-bold leading-none font-mono">41</div>
                          <div className="text-[10px] uppercase opacity-70 mt-1 font-medium">Days</div>
                        </div>
                        <div className="text-xl font-bold opacity-50 pb-4">:</div>
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-bold leading-none font-mono">15</div>
                          <div className="text-[10px] uppercase opacity-70 mt-1 font-medium">Hrs</div>
                        </div>
                        <div className="text-xl font-bold opacity-50 pb-4">:</div>
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-bold leading-none font-mono">24</div>
                          <div className="text-[10px] uppercase opacity-70 mt-1 font-medium">Min</div>
                        </div>
                        <div className="text-xl font-bold opacity-50 pb-4">:</div>
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-bold leading-none font-mono text-yellow-300">04</div>
                          <div className="text-[10px] uppercase opacity-70 mt-1 font-medium">Sec</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50/50">
                  <MainSwiper products={products_super_deals} type="curved">
                    <div className="hidden"></div>
                  </MainSwiper>
                </div>
              </div>

              {/* Promo Banners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Sellers Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                      </div>
                      <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">Top Sellers</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-2">HOT</h3>
                    <h4 className="text-xl font-semibold text-white/90 mb-4">Top Sellers</h4>
                    <p className="text-slate-400 mb-8 max-w-[200px]">Most popular items this week</p>
                    
                    <Link href="/browse?sort=best-selling" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:gap-3 transition-all text-white border-b-2 border-white/20 pb-1 hover:border-white">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* Decorative Image/Icon */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform translate-x-4 translate-y-4">
                    <Flame className="w-full h-full" />
                  </div>
                </div>

                {/* Top Rated Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:bg-yellow-500/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      </div>
                      <span className="text-sm font-bold text-yellow-600 uppercase tracking-wider">Top Rated</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-2 text-slate-900">★</h3>
                    <h4 className="text-xl font-semibold text-slate-800 mb-4">Top Rated</h4>
                    <p className="text-slate-500 mb-8 max-w-[200px]">Curated by our experts</p>
                    
                    <Link href="/browse?sort=rating-desc" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:gap-3 transition-all text-slate-900 border-b-2 border-slate-200 pb-1 hover:border-slate-900">
                      View Collection <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Decorative Image/Icon */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform translate-x-4 translate-y-4">
                    <Star className="w-full h-full" />
                  </div>
                </div>
              </div>

              <FeaturedCategories categories={featuredCategories} />
              <div>
                {/* Header */}
                <div className="text-center h-[32px] leading-[32px] text-[24px] font-extrabold text-[#222] flex justify-center">
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                  <span>More to love</span>
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                </div>
                <div className="mt-7 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1530px]:grid-cols-7 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}