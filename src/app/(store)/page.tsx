import AnimatedDeals from "@/components/store/home/animated-deals";
import Featured from "@/components/store/home/main/featured";
import HomeMainSwiper from "@/components/store/home/main/home-swiper";
import HomeUserCard from "@/components/store/home/main/user/user";
import Sideline from "@/components/store/home/sideline/sideline";
import MainSwiper from "@/components/store/shared/swiper";
import { ProductType, SimpleProduct } from "@/lib/types";
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
    { property: "offer", value: "best-deals", type: "full" },
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
          <div className="max-w-[1600px] mx-auto min-h-screen p-2 sm:p-3 md:p-4">
            {/* Main */}
            <div className="w-full grid gap-2 grid-cols-1 min-[915px]:grid-cols-[1fr_350px] min-[1465px]:grid-cols-[200px_1fr_350px]">
              {/* Left */}
              <div
                className="cursor-pointer hidden min-[1465px]:block bg-cover bg-center bg-no-repeat rounded-md h-[400px] sm:h-[500px] min-[1465px]:h-[600px] w-full"
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
              <div className="h-full hidden min-[915px]:block">
                <HomeUserCard
                  products={products_user_card.filter(
                    (product): product is SimpleProduct =>
                      "variantSlug" in product
                  )}
                />
              </div>
            </div>
            {/* Mobile User Card - only show on mobile */}
            <div className="mt-4 min-[915px]:hidden">
              <HomeUserCard
                products={products_user_card.filter(
                  (product): product is SimpleProduct =>
                    "variantSlug" in product
                )}
              />
            </div>
            {/* Animated deals */}
            <div className="mt-2 hidden min-[915px]:block">
              <AnimatedDeals />
            </div>
            <div className="mt-10 space-y-6">
              {/* Super Deals Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-pink-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">Limited Time Offer</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter drop-shadow-sm">Super Deals</h2>
                    </div>
                  </div>
                </div>
                <div className="p-2 sm:p-6 bg-gray-50/50">
                  <MainSwiper 
                    products={[...products_best_deals, ...products_super_deals].filter(
                      (product): product is ProductType => "variants" in product
                    )} 
                    type="curved"
                    autoplay={{
                      delay: 2000,
                      disableOnInteraction: false,
                    }}
                    breakpoints={{
                      0: { slidesPerView: 2, spaceBetween: 5 },
                      500: { slidesPerView: 2.2, spaceBetween: 8 },
                      768: { slidesPerView: 3, spaceBetween: 20 },
                      1024: { slidesPerView: 4, spaceBetween: 20 },
                      1280: { slidesPerView: 5, spaceBetween: 20 },
                      1400: { slidesPerView: 6, spaceBetween: 20 }
                    }}
                  >
                    <div className="hidden"></div>
                  </MainSwiper>
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
                <div className="mt-4 md:mt-7 bg-gradient-to-br from-gray-50 to-white p-2 sm:p-6 rounded-xl md:rounded-2xl shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1530px]:grid-cols-7 gap-2 md:gap-4">
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