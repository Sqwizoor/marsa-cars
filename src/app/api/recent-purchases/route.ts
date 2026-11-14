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

const CITY_FIXES: Record<string, string> = {
  johannesgurg: "Johannesburg",
  jhb: "Johannesburg",
  pta: "Pretoria",
  cpt: "Cape Town",
  dbn: "Durban",
};

function formatBuyerName(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (!first) return "Verified Buyer";
  const capFirst = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  if (!last) return capFirst;
  return `${capFirst} ${last.charAt(0).toUpperCase()}.`;
}

function normalizeCity(city?: string | null, state?: string | null): string {
  const raw = (city || "").trim();
  if (raw) {
    const fixed = CITY_FIXES[raw.toLowerCase()];
    if (fixed) return fixed;
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  const prov = (state || "").trim();
  return prov || "South Africa";
}

function formatTimeLabel(createdAt: Date): string {
  const diffMs = Math.max(0, Date.now() - createdAt.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  return "Verified purchase";
}

export async function GET() {
  try {
    const orderItems = await db.orderItem.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productSlug: true,
        variantSlug: true,
        name: true,
        image: true,
        price: true,
        createdAt: true,
        orderGroup: {
          select: {
            order: {
              select: {
                shippingAddress: {
                  select: {
                    firstName: true,
                    lastName: true,
                    city: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const seenSlugs = new Set<string>();
    const items: RecentPurchaseNotification[] = [];

    for (const item of orderItems) {
      const slugKey = `${item.productSlug}/${item.variantSlug}`;
      if (seenSlugs.has(slugKey) || !item.image || !item.productSlug || !item.variantSlug) {
        continue;
      }
      seenSlugs.add(slugKey);

      const address = item.orderGroup?.order?.shippingAddress;
      const cleanName = item.name.split(" · ")[0].trim();

      items.push({
        id: item.id,
        buyerName: formatBuyerName(address?.firstName, address?.lastName),
        city: normalizeCity(address?.city, address?.state),
        productName: cleanName,
        productSlug: item.productSlug,
        variantSlug: item.variantSlug,
        image: item.image,
        price: item.price,
        timeLabel: formatTimeLabel(new Date(item.createdAt)),
      });

      if (items.length >= 10) break;
    }

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
