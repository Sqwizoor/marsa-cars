import CheckoutContainer from "@/components/store/checkout-page/container";
import { db } from "@/lib/db";
import { Country } from "@/lib/types";
import { getUserShippingAddresses } from "@/queries/user";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPostHogClient } from "@/lib/posthog-server";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect("/cart");

  // Get user cart
  const cart = await db.cart.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      cartItems: true,
      coupon: {
        include: {
          store: true,
        },
      },
    },
  });

  if (!cart) redirect("/cart");

  // Track checkout page viewed event (conversion funnel)
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: 'checkout_page_viewed',
    properties: {
      cart_id: cart.id,
      items_count: cart.cartItems.length,
      has_coupon: !!cart.coupon,
    },
  });

  // Get user shipping address
  const addresses = await getUserShippingAddresses();

  // Get list of countries, ensuring South Africa is primary (first)
  const dbCountries = await db.country.findMany();
  const countries = dbCountries.sort((a, b) =>
    a.code === "ZA" ? -1 : b.code === "ZA" ? 1 : a.name.localeCompare(b.name)
  );

  // Get cookies from the store
  const cookieStore = cookies();
  const userCountryCookie = (await cookieStore).get("userCountry");

  // Set default country to South Africa
  let userCountry: Country = {
    name: "South Africa",
    city: "Johannesburg",
    code: "ZA",
    region: "Gauteng",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  return (
    <>
      {/* <Header /> */}
      <div className="bg-[#f4f4f4] min-h-[calc(100vh-65px)]">
        <div className="max-w-container mx-auto py-5 px-2">
          <CheckoutContainer
            cart={cart}
            countries={countries}
            addresses={addresses}
            userCountry={userCountry}
          />
        </div>
      </div>
    </>
  );
}
