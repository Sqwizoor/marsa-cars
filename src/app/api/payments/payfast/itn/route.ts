import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPayFastConfig } from "@/lib/payfast/config";
import { validateITNWithPayFast, verifyITNSignature, isFromPayFast } from "@/lib/payfast/utils";

export async function POST(req: NextRequest) {
  try {
    // PayFast sends application/x-www-form-urlencoded
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const itn: Record<string, any> = {};
    params.forEach((v, k) => (itn[k] = v));

    // Verify signature
    const sigOk = verifyITNSignature(itn);
    if (!sigOk) return new NextResponse("Invalid signature", { status: 400 });

    // Validate with PayFast servers
    const isValid = await validateITNWithPayFast(raw);
    if (!isValid) return new NextResponse("Invalid ITN", { status: 400 });

    const status = itn["payment_status"]; // COMPLETE or FAILED
    const orderId = itn["m_payment_id"]; // our ID

    if (!orderId) return new NextResponse("Missing order id", { status: 400 });

    // Optional: basic source IP check (skip strict check in sandbox)
    let cfg;
    try {
      cfg = getPayFastConfig();
    } catch (error) {
      console.error("PayFast config error in ITN:", error);
      return new NextResponse("Payment gateway configuration error", { status: 503 });
    }
    
    if (cfg.mode === "live") {
      const fwd = req.headers.get("x-forwarded-for");
      const clientIp = fwd ? fwd.split(",")[0].trim() : (req.headers.get("x-real-ip") || null);
      if (!isFromPayFast(clientIp)) {
        return new NextResponse("Invalid source IP", { status: 400 });
      }
    }

    // Compare amount (tolerance 0.01)
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return new NextResponse("Order not found", { status: 404 });
    const expected = Number(order.total);
    const gross = parseFloat(itn["amount_gross"] || "0");
    if (Math.abs(expected - gross) > 0.01) {
      return new NextResponse("Amount mismatch", { status: 400 });
    }

    if (status === "COMPLETE") {
      // Mark paid
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "Paid",
          orderStatus: "Pending",
          paymentDetails: {
            upsert: {
              create: {
                paymentMethod: "PayFast",
                paymentInetntId: itn["pf_payment_id"] || "",
                status: "Completed",
                amount: parseFloat(itn["amount_gross"] || "0"),
                currency: "ZAR",
                user: { connect: { id: (await db.order.findUnique({ where: { id: orderId } }))!.userId } },
              },
              update: {
                paymentMethod: "PayFast",
                paymentInetntId: itn["pf_payment_id"] || "",
                status: "Completed",
                amount: parseFloat(itn["amount_gross"] || "0"),
                currency: "ZAR",
              },
            },
          },
        },
      });
    } else if (status === "FAILED") {
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: "Failed", paymentDetails: { upsert: { create: { paymentMethod: "PayFast", paymentInetntId: itn["pf_payment_id"] || "", status: "Failed", amount: parseFloat(itn["amount_gross"] || "0"), currency: "ZAR", user: { connect: { id: (await db.order.findUnique({ where: { id: orderId } }))!.userId } } }, update: { paymentMethod: "PayFast", paymentInetntId: itn["pf_payment_id"] || "", status: "Failed", amount: parseFloat(itn["amount_gross"] || "0"), currency: "ZAR" } } } },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (e: any) {
    console.error("PayFast ITN error", e);
    return new NextResponse("Server error", { status: 500 });
  }
}
