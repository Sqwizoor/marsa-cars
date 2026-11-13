import { PaymentDetails } from "@prisma/client";

export default function OrderInfoCard({
  totalItemsCount,
  deliveredItemsCount,
  paymentDetails,
}: {
  totalItemsCount: number;
  deliveredItemsCount: number;
  paymentDetails: PaymentDetails | null;
}) {
  return (
    <div>
      <div className="p-4 shadow-sm w-full space-y-3 rounded-lg bg-white">
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Total Items</p>
          <p className="text-neutral-500 text-sm text-right">{totalItemsCount}</p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Delivered</p>
          <p className="text-neutral-500 text-sm text-right">{deliveredItemsCount}</p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Payment Status</p>
          <p className="text-neutral-500 text-sm text-right">
            {paymentDetails ? paymentDetails.status : "Unpaid"}
          </p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Payment Method</p>
          <p className="text-neutral-500 text-sm text-right">
            {paymentDetails ? paymentDetails.paymentMethod : "-"}
          </p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Payment Reference</p>
          <p className="text-neutral-500 text-sm text-right break-all">
            {paymentDetails ? paymentDetails.paymentInetntId : "-"}
          </p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="text-main-secondary text-sm shrink-0">Paid at</p>
          <p className="text-neutral-500 text-sm text-right">
            {paymentDetails && paymentDetails.status === "Completed"
              ? paymentDetails.updatedAt.toDateString()
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
