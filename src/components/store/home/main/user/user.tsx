import type { SimpleProduct } from "@/lib/types"
import { currentUser } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../../../ui/button"
import UserCardProducts from "./products"

export default async function HomeUserCard({
  products,
}: {
  products: SimpleProduct[]
}) {
  const user = await currentUser()
  const role = user?.privateMetadata.role

  return (
    <div className="h-full hidden min-[1170px]:block relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="h-full rounded-lg overflow-hidden pb-9 relative">
        {/* Header background */}
        <div className="absolute top-0 left-0 w-full h-[101px] z-0">
          <Image
            src="/assets/images/user-card-bg.avif"
            alt="Background"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1170px) 100vw, 0vw"
          />
        </div>

        {/*User info - reverted to original implementation */}
        <div className="w-full h-[76px] relative z-10">
          <div className="mx-auto cursor-pointer">
            <Image
              src={user ? user.imageUrl : "/assets/images/default-user.avif"}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover absolute left-1/2 -translate-x-1/2 top-2"
            />
          </div>
          <div className="absolute top-16 w-full h-5 font-bold text-black text-center cursor-pointer capitalize">
            {user ? user.fullName?.toLowerCase() : "Welcome to GoShop"}
          </div>
        </div>

        {/* User links with improved styling */}
        <div className="w-full h-[100px] flex items-center gap-x-6 justify-center mt-4 relative z-10">
          <Link href="/profile" className="group transition-transform duration-300 hover:-translate-y-1">
            <div className="relative w-12 h-12 mx-auto rounded-full overflow-hidden shadow-sm">
              <Image src="/assets/images/user-card/user.webp" alt="Account" fill className="object-cover" />
            </div>
            <span className="w-full max-h-7 text-xs text-main-primary text-center block mt-1">Account</span>
          </Link>

          <Link href="/profile/orders" className="group transition-transform duration-300 hover:-translate-y-1">
            <div className="relative w-12 h-12 mx-auto rounded-full overflow-hidden shadow-sm">
              <Image src="/assets/images/user-card/orders.webp" alt="Orders" fill className="object-cover" />
            </div>
            <span className="w-full max-h-7 text-xs text-main-primary text-center block mt-1 pl-1">Orders</span>
          </Link>

          <Link href="/profile/wishlist" className="group transition-transform duration-300 hover:-translate-y-1">
            <div className="relative w-12 h-12 mx-auto rounded-full overflow-hidden shadow-sm">
              <Image src="/assets/images/user-card/wishlist.png" alt="Wishlist" fill className="object-cover" />
            </div>
            <span className="w-full max-h-7 text-xs text-main-primary text-center block mt-1">Wishlist</span>
          </Link>
        </div>

        {/* Action buttons with improved styling */}
        <div className="w-full px-4 relative z-10">
          {user ? (
            <div className="w-full">
              {role === "ADMIN" ? (
                <Button
                  variant="orange-gradient"
                  className="rounded-md w-full shadow-sm hover:shadow transition-all duration-300"
                >
                  <Link href={"/dashboard/admin"} className="w-full">
                    Switch to Admin Dashboard
                  </Link>
                </Button>
              ) : role === "SELLER" ? (
                <Button
                  variant="orange-gradient"
                  className="rounded-md w-full shadow-sm hover:shadow transition-all duration-300"
                >
                  <Link href={"/dashboard/seller"} className="w-full">
                    Switch to Seller Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="orange-gradient"
                  className="rounded-md w-full shadow-sm hover:shadow transition-all duration-300"
                >
                  <Link href={"/seller/apply"} className="w-full">
                    Apply to become a seller
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-between gap-x-4">
              <Button variant="orange-gradient" className="flex-1 shadow-sm hover:shadow transition-all duration-300">
                <Link href="/sign-up" className="w-full">
                  Join
                </Link>
              </Button>
              <Button variant="gray" className="flex-1 shadow-sm hover:shadow transition-all duration-300">
                <Link href="/sign-in" className="w-full">
                  Sign in
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Ad swiper with improved styling and dark overlay for better text visibility */}
        <div className="w-full h-full flex-1 px-4 max-h-[420px] pb-[102px] mt-4 relative z-10">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-sm relative">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/assets/images/featured/shocks.png"
                alt="Featured"
                fill
                className="object-cover"
                sizes="(min-width: 1170px) 100vw, 0vw"
              />
              {/* Dark overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10"></div>
            </div>

            <Link href="" className="block relative z-20">
              <div className="h-24 p-2.5">
                <div className="mt-2.5 text-white leading-[18px] text-[13px] font-medium">Your favorite store</div>
                <div className="leading-5 font-bold mt-2.5 text-white text-lg drop-shadow-md">
                  Check out the latest new deals
                </div>
              </div>
            </Link>

            {/* Products with relative positioning to appear above the background */}
            <div className="relative z-20 px-2.5">
              <UserCardProducts products={products} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

