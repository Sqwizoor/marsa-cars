import OrderInfoCard from "@/components/store/cards/order/info"
import OrderTotalDetailsCard from "@/components/store/cards/order/total"
import OrderUserDetailsCard from "@/components/store/cards/order/user"
import OrderGroupsContainer from "@/components/store/order-page/groups-container"
import OrderHeader from "@/components/store/order-page/header"
import { Separator } from "@/components/ui/separator"
import { getOrder } from "@/queries/order"
import { redirect } from "next/navigation"

export default async function OrderPage({
  params,
}: {
  params: { orderId: string }
}) {
  const order = await getOrder(params.orderId)
  if (!order) return redirect("/")

  // Get the total count of items across all groups
  const totalItemsCount = order?.groups.reduce((total, group) => total + group._count.items, 0)

  // Calculate the total number of delivered items
  const deliveredItemsCount = order?.groups.reduce((total, group) => {
    if (group.status === "Delivered") {
      return total + group.items.length
    }
    return total
  }, 0)

  const isPendingOrFailed = order.paymentStatus === "Pending" || order.paymentStatus === "Failed"

  return (
    <div>
      {/* <Header /> */}
      <div className="p-2">
        <OrderHeader order={order} />

        {/* Mobile Layout */}
        <div className="md:hidden w-full space-y-4">
          {/* Col 1 -> User, Order details */}
          <div className="flex flex-col gap-y-5">
            <OrderUserDetailsCard details={order.shippingAddress} />
            <OrderInfoCard
              totalItemsCount={totalItemsCount}
              deliveredItemsCount={deliveredItemsCount}
              paymentDetails={order.paymentDetails}
            />
            {!isPendingOrFailed && (
              <OrderTotalDetailsCard
                details={{
                  subTotal: order.subTotal,
                  shippingFees: order.shippingFees,
                  total: order.total,
                }}
              />
            )}
          </div>

          {/* Col 2 -> Order Groups */}
          <div>
            <OrderGroupsContainer groups={order.groups} />
          </div>

          {/* Col 3 -> Payment Gateways */}
          {isPendingOrFailed && (
            <div className="border-t pt-4 space-y-5">
              <OrderTotalDetailsCard
                details={{
                  subTotal: order.subTotal,
                  shippingFees: order.shippingFees,
                  total: order.total,
                }}
              />
              <Separator />
              {/* <OrderPayment orderId={order.id} amount={order.total} /> */}
            </div>
          )}
        </div>

        {/* Desktop Layout - Original with responsive adjustments */}
        <div
          className="hidden md:grid w-full"
          style={{
            gridTemplateColumns: isPendingOrFailed ? "minmax(250px, 1fr) 3fr 1fr" : "1fr 4fr",
          }}
        >
          {/* Col 1 -> User, Order details */}
          <div className="h-[calc(100vh-137px)] overflow-auto flex flex-col gap-y-5 scrollbar">
            <OrderUserDetailsCard details={order.shippingAddress} />
            <OrderInfoCard
              totalItemsCount={totalItemsCount}
              deliveredItemsCount={deliveredItemsCount}
              paymentDetails={order.paymentDetails}
            />
            {!isPendingOrFailed && (
              <OrderTotalDetailsCard
                details={{
                  subTotal: order.subTotal,
                  shippingFees: order.shippingFees,
                  total: order.total,
                }}
              />
            )}
          </div>

          {/* Col 2 -> Order Groups */}
          <div className="h-[calc(100vh-137px)] overflow-auto scrollbar">
            <OrderGroupsContainer groups={order.groups} />
          </div>

          {/* Col 3 -> Payment Gateways */}
          {isPendingOrFailed && (
            <div className="h-[calc(100vh-137px)] overflow-auto scrollbar border-l px-2 py-4 space-y-5">
              <OrderTotalDetailsCard
                details={{
                  subTotal: order.subTotal,
                  shippingFees: order.shippingFees,
                  total: order.total,
                }}
              />
              <Separator />
              {/* <OrderPayment orderId={order.id} amount={order.total} /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

