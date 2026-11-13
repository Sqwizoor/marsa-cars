import OrderStatusTag from "@/components/shared/order-status";
import { OrderGroupWithItemsType, OrderStatus } from "@/lib/types";
import Image from "next/image";
import React from "react";
import ProductRow from "./product-row";
import GroupTrackingSection from "./group-tracking-section";

export default function OrderGroupTable({
  group,
  deliveryInfo,
}: {
  group: OrderGroupWithItemsType;
  deliveryInfo: {
    shippingService: string;
    deliveryMinDate: string;
    deliveryMaxDate: string;
  };
}) {
  const { shippingService, deliveryMaxDate, deliveryMinDate } = deliveryInfo;
  const { coupon, couponId, subTotal, total, shippingFees } = group;
  let discountedAmount = 0;
  if (couponId && coupon) {
    discountedAmount = ((subTotal + shippingFees) * coupon.discount) / 100;
  }
  return (
    <div className="border border-gray-200 rounded-xl pt-5 sm:pt-6 max-w-xl max-lg:mx-auto lg:max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 pb-5 sm:pb-6 border-b border-gray-200">
        <div className="min-w-0">
          <p className="font-semibold text-sm sm:text-base leading-7 text-black break-all">
            Order Id:
            <span className="text-blue-primary font-medium ms-2">
              #{group.id}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-3 sm:mt-4">
            <Image
              src={group.store.logo}
              alt={group.store.name}
              width={100}
              height={100}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />
            <span className="text-main-secondary font-medium text-sm sm:text-base">
              {group.store.name}
            </span>
            <div className="hidden sm:block w-[1px] h-5 bg-border mx-1" />
            <p className="text-xs sm:text-sm text-gray-600">{shippingService}</p>
          </div>
        </div>
        <div className="self-start lg:self-center shrink-0">
          <OrderStatusTag status={group.status as OrderStatus} />
        </div>
      </div>
      <div className="w-full px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4">
        <div>
          {group.items.map((product, index) => (
            <ProductRow key={index} product={product} />
          ))}
        </div>
        <div className="flex items-center pb-4 lg:pb-0 lg:justify-center text-left lg:text-center border-t lg:border-t-0 pt-3 lg:pt-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:block">
            <p className="font-medium text-sm leading-6 text-black">
              Expected Delivery Time
            </p>
            <p className="font-medium text-sm sm:text-base leading-7 lg:mt-3 text-emerald-500">
              {deliveryMinDate} - {deliveryMaxDate}
            </p>
          </div>
        </div>
      </div>
      {/* Bob Go Order Tracking */}
      <GroupTrackingSection orderGroupId={group.id} orderId={group.orderId} />
      {/* Group info */}
      <div className="w-full border-t border-gray-200 px-4 sm:px-6 py-2 lg:py-0 flex flex-col lg:flex-row items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row flex-wrap items-center w-full lg:w-auto max-lg:border-b border-gray-200 pb-2 lg:pb-0">
          <button className="flex outline-0 py-3 sm:py-5 sm:pr-6 sm:border-r border-gray-200 whitespace-nowrap gap-2 items-center justify-center font-semibold group text-sm sm:text-base text-black bg-white transition-all duration-500 hover:text-blue-primary">
            <svg
              className="stroke-black transition-all duration-500 group-hover:stroke-blue-primary"
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M5.5 5.5L16.5 16.5M16.5 5.5L5.5 16.5"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Cancel Order
          </button>
          <p className="font-medium text-sm sm:text-base text-gray-900 px-3 sm:px-6 py-2 sm:py-3 max-lg:text-center sm:border-r border-gray-200">
            Subtotal:
            <span className="text-gray-500 ms-1">
              R{group.subTotal.toFixed(2)}
            </span>
          </p>
          <p className="font-medium text-sm sm:text-base text-gray-900 px-3 sm:px-6 py-2 sm:py-3 max-lg:text-center sm:border-r border-gray-200">
            Shipping Fees:
            <span className="text-gray-500 ms-1">
              R{group.shippingFees.toFixed(2)}
            </span>
          </p>
          {group.couponId && (
            <p className="font-medium text-sm sm:text-base text-gray-900 px-3 sm:pl-6 py-2 sm:py-3 max-lg:text-center">
              Coupon ({coupon?.code})
              <span className="text-gray-500 ms-1">(-{coupon?.discount}%)</span>
              <span className="text-gray-500 ms-1">
                (-R{discountedAmount.toFixed(2)})
              </span>
            </p>
          )}
        </div>
        <div>
          <p className="font-semibold text-base sm:text-xl text-black py-2">
            Total price:
            <span className="text-blue-primary ms-1">R{total.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
