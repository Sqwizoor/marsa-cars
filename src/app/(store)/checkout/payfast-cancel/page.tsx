export default async function PayFastCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ m_payment_id?: string; payment_status?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.m_payment_id;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-red-600">Payment cancelled</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Your PayFast payment was cancelled. You can resume checkout or keep shopping.
      </p>

      {orderId && (
        <p className="mt-4 text-sm">
          <span className="font-semibold">Order ID:</span> {orderId}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        <a
          href={orderId ? `/order/${orderId}` : "/cart"}
          className="inline-flex items-center px-4 py-2 rounded-md border hover:bg-muted"
        >
          {orderId ? "View order" : "Go to cart"}
        </a>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
        >
          Continue shopping
        </a>
      </div>

      <div className="mt-8 rounded-md bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
        If you cancelled by mistake, you can try paying again from your order page or your cart.
      </div>
    </div>
  );
}
