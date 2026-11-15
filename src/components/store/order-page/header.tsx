"use client";
import OrderStatusTag from "@/components/shared/order-status";
import PaymentStatusTag from "@/components/shared/payment-status";
import { Button } from "@/components/ui/button";
import { OrderFulltType, OrderStatus, PaymentStatus } from "@/lib/types";
import { ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import React, { useEffect } from "react";
import { generateOrderPDFBlob } from "./pdf-invoice";
import { downloadBlobAsFile, printPDF } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { trackPurchase } from "@/lib/posthog-tracking";

export default function OrderHeader({ order }: { order: OrderFulltType }) {
  const router = useRouter();

  useEffect(() => {
    if (!order || order.paymentStatus === "Failed") return;
    const storageKey = `fbq_purchase_${order.id}`;
    if (typeof window !== "undefined" && !localStorage.getItem(storageKey)) {
      const items = order.groups.flatMap((group) =>
        group.items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );
      trackPurchase({
        id: order.id,
        total: order.total,
        items,
      });
      localStorage.setItem(storageKey, "true");
    }
  }, [order]);

  if (!order) return null;

  const handleDownload = async () => {
    try {
      const pdfBlob = await generateOrderPDFBlob(order);
      downloadBlobAsFile(pdfBlob, `Order_${order.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handlePrint = async () => {
    try {
      const pdfBlob = await generateOrderPDFBlob(order);
      printPDF(pdfBlob);
    } catch (error) {
      console.error("Error printing PDF:", error);
    }
  };
  return (
    <div>
      <div className="w-full border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <div className="sm:border-r sm:pr-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-9 h-9 sm:w-10 sm:h-10 border rounded-full grid place-items-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="stroke-main-secondary w-5 h-5" />
            </button>
          </div>
          <h1 className="text-main-secondary text-sm sm:text-base font-medium">Order Details</h1>
          <ChevronRight className="stroke-main-secondary w-4 shrink-0" />
          <h2 className="text-xs sm:text-sm font-mono break-all">Order #{order.id}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusTag status={order.paymentStatus as PaymentStatus} />
            <OrderStatusTag status={order.orderStatus as OrderStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => handleDownload()}>
            <Download className="w-4 me-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => handlePrint()}>
            <Printer className="w-4 me-2" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
