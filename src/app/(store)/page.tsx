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
            <div className="mt-10 space-y-10">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4 text-white">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Limited Time Offer</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">Super Deals</h2>
                      <p className="text-white/90 text-sm font-medium mt-1">Save up to 90% on premium auto parts</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                        <div className="text-center px-2">
                          <div className="text-lg font-bold leading-none">02</div>
                          <div className="text-[10px] uppercase opacity-80">Hrs</div>
                        </div>
                        <div className="text-xl font-bold">:</div>
                        <div className="text-center px-2">
                          <div className="text-lg font-bold leading-none">45</div>
                          <div className="text-[10px] uppercase opacity-80">Min</div>
                        </div>
                        <div className="text-xl font-bold">:</div>
                        <div className="text-center px-2">
                          <div className="text-lg font-bold leading-none">12</div>
                          <div className="text-[10px] uppercase opacity-80">Sec</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <MainSwiper products={products_super_deals} type="curved">
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