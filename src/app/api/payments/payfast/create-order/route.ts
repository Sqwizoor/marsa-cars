import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { placeOrder } from "@/queries/user";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    const { shippingAddressId, cartId } = await req.json();
    if (!shippingAddressId || !cartId) {
      return NextResponse.json({ error: "Missing shippingAddressId or cartId" }, { status: 400 });
    }
    const address = await db.shippingAddress.findFirst({ where: { id: shippingAddressId, userId: user.id } });
    if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    const order = await placeOrder(address as any, cartId);
    return NextResponse.json(order);
  } catch (e: any) {
    console.error("PayFast create-order error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
