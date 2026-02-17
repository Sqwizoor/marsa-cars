import ProductCard from "@/components/store/cards/product/product-card";
import Featured from "@/components/store/home/main/featured";
import HomeMainSwiper from "@/components/store/home/main/home-swiper";
import HomeUserCard from "@/components/store/home/main/user/user";
import Sideline from "@/components/store/home/sideline/sideline";
import SponsoredCars from "@/components/store/home/sponsored-cars";
import MainSwiper from "@/components/store/shared/swiper";
import { ProductType, SimpleProduct } from "@/lib/types";
import { getHomeDataDynamic, getHomeFeaturedCategories } from "@/queries/home";
import { getSponsoredCars } from "@/queries/cars";
// import { getProducts } from "@/queries/product"; // Replaced by randomized
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getOrCreateSessionId } from "@/lib/session";
import { getRandomizedProducts, getFairSponsoredProducts } from "@/queries/randomized-products";
import FeaturedCategories from "@/components/store/home/featured-categories";
import ArticlesSection from "@/components/store/home/articles-section";

export default async function HomePage() {
  const sessionId = await getOrCreateSessionId();

  // Randomized products for "More to love"
  const productsData = await getRandomizedProducts({ sessionId, limit: 100, page: 1 });
  const { products } = productsData;

  // Fairly distributed sponsored products
  const sponsoredProducts = await getFairSponsoredProducts({ sessionId, limit: 10 });

  // Randomized sponsored cars (limited to 8)
  const sponsoredCars = await getSponsoredCars(sessionId, 8);

  const {
    products_super_deals,
    products_best_deals,
    products_user_card,
    products_featured,
  } = await getHomeDataDynamic([
    { property: "offer", value: "best-deals", type: "full", limit: 10 },
    { property: "offer", value: "super-deals", type: "full", limit: 10 },
    { property: "offer", value: "user-card", type: "simple", limit: 6 },
    { property: "offer", value: "featured", type: "simple", limit: 12 },
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
            <div className="w-full min-w-0 grid gap-2 grid-cols-1 min-[915px]:grid-cols-[minmax(0,1fr)_350px] min-[1465px]:grid-cols-[200px_minmax(0,1fr)_350px]">
              {/* Left */}
              <div
                className="cursor-pointer hidden min-[1465px]:block bg-cover bg-center bg-no-repeat rounded-md h-[400px] sm:h-[500px] min-[1465px]:h-auto w-full"
                style={{
                  backgroundImage:
                    "url(/assets/images/sideline/new-side.png)",
                }}
              />
              {/* Middle */}
              <div className="space-y-2 h-fit min-w-0 w-full max-w-full overflow-hidden">
                {/* Main swiper */}
                <HomeMainSwiper />
                {/* Featured card */}
                {/* We could also randomize this if needed, but keeping logic for now */}
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
            
            {/* Sponsored Products Section (Replacing Cars) */}
            {sponsoredProducts.length > 0 && (
               <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 px-1">
                   {/* <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> */}
                   <h3 className="text-xl font-bold text-gray-800">Sponsored Products</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                   <MainSwiper 
                     products={sponsoredProducts} 
                     type="curved"
                     autoplay={{
                       delay: 3000,
                       disableOnInteraction: false,
                     }}
                     breakpoints={{
                       0: { slidesPerView: 2, spaceBetween: 10 },
                       640: { slidesPerView: 3, spaceBetween: 15 },
                       1024: { slidesPerView: 4, spaceBetween: 20 },
                       1280: { slidesPerView: 5, spaceBetween: 20 },
                     }}
                   >
                     <div className="hidden"></div>
                   </MainSwiper>
                </div>
               </div>
            )}

            {/* Sponsored Cars Section */}
            <div className="mt-2">
              <SponsoredCars cars={sponsoredCars} />
            </div>

            <div className="mt-10 space-y-6">
              {/* Super Deals Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-white p-6 relative overflow-hidden border-b border-gray-100">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-50 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 border border-gray-200">Limited Time Offer</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-gray-900">Super Deals</h2>
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
              
              {/* More to Love - Randomized */}
              <div>
                {/* Header */}
                <div className="text-center h-[32px] leading-[32px] text-[24px] font-extrabold text-[#222] flex justify-center">
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                  <span>More to love</span>
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                </div>
                <div className="mt-4 md:mt-7 bg-gradient-to-br from-gray-50 to-white p-2 sm:p-6 rounded-xl md:rounded-2xl shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1530px]:grid-cols-7 gap-2 md:gap-4">
                    {products.slice(0, 10).map((product, i) => (
                      <div key={product.id} className={i > 1 ? "hidden md:block" : ""}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link 
                      href="/browse"
                      className="group inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-foreground/80 font-medium hover:bg-gray-50 hover:text-foreground hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow"
                    >
                      View All Products
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <ArticlesSection />
            </div>



          </div>
        </div>
      </div>
    </>
  );
}