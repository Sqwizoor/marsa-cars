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

    // Log ITN receipt
    console.log("PayFast Order ITN received:", {
      payment_status: itn["payment_status"],
      m_payment_id: itn["m_payment_id"],
      amount: itn["amount_gross"],
    });

    // 1. Verify signature
    const sigOk = verifyITNSignature(itn);
    if (!sigOk) {
      console.warn("Invalid PayFast ITN signature");
      return new NextResponse("OK", { status: 200 });
    }

    // 2. Validate with PayFast servers
    const isValid = await validateITNWithPayFast(raw);
    if (!isValid) {
      console.warn("PayFast ITN validation failed");
      return new NextResponse("OK", { status: 200 });
    }

    // 3. Get config and validate IP in live mode
    let cfg;
    try {
      cfg = getPayFastConfig();
    } catch (error) {
      console.error("PayFast config error in ITN:", error);
      return new NextResponse("OK", { status: 200 });
    }
    
    if (cfg.mode === "live") {
      const fwd = req.headers.get("x-forwarded-for");
      const clientIp = fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip");
      if (!isFromPayFast(clientIp)) {
        console.warn("Order ITN from invalid IP:", clientIp);
        return new NextResponse("OK", { status: 200 });
      }
    }

    const status = itn["payment_status"]; // COMPLETE or FAILED
    const orderId = itn["m_payment_id"]; // our ID

    if (!orderId) {
      console.warn("Missing order ID in ITN");
      return new NextResponse("OK", { status: 200 });
    }

    // 4. Verify order exists and amount matches
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn("Order not found:", orderId);
      return new NextResponse("OK", { status: 200 });
    }

    const expected = Number(order.total);
    const gross = parseFloat(itn["amount_gross"] || "0");
    
    // Allow small tolerance for rounding (0.01)
    if (Math.abs(expected - gross) > 0.01) {
      console.warn("Amount mismatch:", { expected, received: gross, orderId });
      return new NextResponse("OK", { status: 200 });
    }

    // 5. Update order based on payment status
    if (status === "COMPLETE") {
      console.log("Marking order as paid:", orderId);
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
                amount: gross,
                currency: "ZAR",
                user: { connect: { id: order.userId } },
              },
              update: {
                paymentMethod: "PayFast",
                paymentInetntId: itn["pf_payment_id"] || "",
                status: "Completed",
                amount: gross,
                currency: "ZAR",
              },
            },
          },
        },
      });
    } else if (status === "FAILED") {
      console.log("Marking order as failed:", orderId);
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "Failed",
          paymentDetails: {
            upsert: {
              create: {
                paymentMethod: "PayFast",
                paymentInetntId: itn["pf_payment_id"] || "",
                status: "Failed",
                amount: gross,
                currency: "ZAR",
                user: { connect: { id: order.userId } },
              },
              update: {
                paymentMethod: "PayFast",
                paymentInetntId: itn["pf_payment_id"] || "",
                status: "Failed",
                amount: gross,
                currency: "ZAR",
              },
            },
          },
        },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (e: any) {
    console.error("PayFast ITN error:", e);
    // Always return 200 to prevent PayFast from retrying
    return new NextResponse("OK", { status: 200 });
  }
}
