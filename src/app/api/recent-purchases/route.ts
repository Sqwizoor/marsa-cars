import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface RecentPurchaseNotification {
  id: string;
  buyerName: string;
  city: string;
  productName: string;
  productSlug: string;
  variantSlug: string;
  image: string;
  price: number;
  timeLabel: string;
}

const BUYER_PROFILES: Array<{ name: string; city: string }> = [
  // Zulu names
  { name: "Sipho Ndlovu", city: "Durban" },
  { name: "Thabo Mkhize", city: "Johannesburg" },
  { name: "Bongani Khumalo", city: "Pietermaritzburg" },
  { name: "Sibusiso Dlamini", city: "Sandton" },
  { name: "Zanele Ngcobo", city: "Umhlanga" },
  { name: "Mandla Zulu", city: "Richards Bay" },
  { name: "Nomvula Sithole", city: "Midrand" },
  { name: "Lungile Buthelezi", city: "Durban" },
  { name: "Ayanda Ntuli", city: "Centurion" },
  { name: "Sandile Mthembu", city: "Johannesburg" },
  { name: "Nonhle Zungu", city: "Ballito" },
  { name: "Vusi Nxumalo", city: "Newcastle" },
  { name: "Nokuthula Gumede", city: "Pinetown" },
  { name: "Siyabonga Mbeje", city: "Roodepoort" },
  { name: "Nkosinathi Cele", city: "Randburg" },
  // Xhosa names
  { name: "Lunga Mbeki", city: "Cape Town" },
  { name: "Siyanda Ndaba", city: "Gqeberha" },
  { name: "Thandiwe Madikizela", city: "East London" },
  { name: "Zolani Kani", city: "Bellville" },
  { name: "Buhle Dyantyi", city: "Somerset West" },
  { name: "Andile Nkomo", city: "Johannesburg" },
  { name: "Nolwazi Mfiki", city: "George" },
  { name: "Lukhanyo Siwisa", city: "Mthatha" },
  { name: "Unathi Xaba", city: "Cape Town" },
  { name: "Khaya Majola", city: "Gqeberha" },
  { name: "Zikhona Gqweta", city: "Durbanville" },
  { name: "Anele Mtshali", city: "Midrand" },
  { name: "BabalwaTshabalala", city: "Pretoria" },
  { name: "Lwazi Mabaso", city: "Stellenbosch" },
  { name: "Sinethemba Mbalo", city: "East London" },
  // Sotho / Tswana / Pedi names
  { name: "Tshepo Mokoena", city: "Pretoria" },
  { name: "Lerato Molefe", city: "Bloemfontein" },
  { name: "Karabo Nkoana", city: "Polokwane" },
  { name: "Kagiso Modise", city: "Rustenburg" },
  { name: "Palesa Sello", city: "Soweto" },
  { name: "Mpho Letsoalo", city: "Centurion" },
  { name: "Thato Kgosana", city: "Midrand" },
  { name: "Tebogo Mabena", city: "Alberton" },
  { name: "Refilwe Motaung", city: "Kempton Park" },
  { name: "Lesedi Phiri", city: "Boksburg" },
  { name: "Boitumelo Mahlangu", city: "Witbank" },
  { name: "Katlego Ramaphosa", city: "Polokwane" },
  { name: "Kabelo Tau", city: "Potchefstroom" },
  { name: "Tumelo Sekhukhune", city: "Vereeniging" },
  { name: "Thapelo Maluleke", city: "Nelspruit" },
  // Broader African names
  { name: "Tendai Moyo", city: "Johannesburg" },
  { name: "Chipo Ndlovu", city: "Sandton" },
  { name: "Tatenda Mutasa", city: "Pretoria" },
  { name: "FaraiChiwenga", city: "Midrand" },
  { name: "Tinashe Sibanda", city: "Randburg" },
  { name: "Tariro Chikwanda", city: "Centurion" },
  { name: "Jabulani Chauke", city: "Nelspruit" },
  { name: "Naledi Khupe", city: "Fourways" },
  { name: "Simba Ncube", city: "Edenvale" },
  { name: "Tafadzwa Gumbo", city: "Bedfordview" },
];

const TIME_LABELS = [
  "14 mins ago",
  "27 mins ago",
  "42 mins ago",
  "1h ago",
  "2h ago",
  "3h ago",
  "4h ago",
  "Earlier today",
  "5h ago",
  "Yesterday",
];

function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export async function GET() {
  try {
    const [orderItems, products] = await Promise.all([
      db.orderItem.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productSlug: true,
          variantSlug: true,
          name: true,
          image: true,
          price: true,
        },
      }),
      db.product.findMany({
        take: 25,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          variants: {
            take: 1,
            select: {
              slug: true,
              images: {
                take: 1,
                select: { url: true },
              },
              sizes: {
                take: 1,
                select: { price: true, discount: true },
              },
            },
          },
        },
      }),
    ]);

    const seenSlugs = new Set<string>();
    const rawProducts: Array<{
      id: string;
      productName: string;
      productSlug: string;
      variantSlug: string;
      image: string;
      price: number;
    }> = [];

    for (const item of orderItems) {
      const slugKey = `${item.productSlug}/${item.variantSlug}`;
      if (
        seenSlugs.has(slugKey) ||
        !item.image ||
        !item.productSlug ||
        !item.variantSlug
      ) {
        continue;
      }
      seenSlugs.add(slugKey);
      rawProducts.push({
        id: item.id,
        productName: item.name.split(" · ")[0].trim(),
        productSlug: item.productSlug,
        variantSlug: item.variantSlug,
        image: item.image,
        price: item.price,
      });
    }

    for (const prod of products) {
      const variant = prod.variants[0];
      const image = variant?.images[0]?.url;
      const size = variant?.sizes[0];
      if (!variant || !image || !size) continue;

      const slugKey = `${prod.slug}/${variant.slug}`;
      if (seenSlugs.has(slugKey)) continue;
      seenSlugs.add(slugKey);

      const finalPrice = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price;

      rawProducts.push({
        id: prod.id,
        productName: prod.name,
        productSlug: prod.slug,
        variantSlug: variant.slug,
        image,
        price: finalPrice,
      });
    }

    const items: RecentPurchaseNotification[] = rawProducts
      .slice(0, 20)
      .map((prod, idx) => {
        const profile = BUYER_PROFILES[idx % BUYER_PROFILES.length];
        return {
          id: prod.id,
          buyerName: formatShortName(profile.name),
          city: profile.city,
          productName: prod.productName,
          productSlug: prod.productSlug,
          variantSlug: prod.variantSlug,
          image: prod.image,
          price: prod.price,
          timeLabel: TIME_LABELS[idx % TIME_LABELS.length],
        };
      });

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch recent purchases:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
