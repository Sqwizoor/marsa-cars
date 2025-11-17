export default async function PayFastReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ m_payment_id?: string; pf_payment_id?: string; payment_status?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.m_payment_id;
  const pfId = params?.pf_payment_id;
  const status = (params?.payment_status || "").toUpperCase();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-main-primary">Payment received</h1>
      <p className="text-sm text-muted-foreground mt-2">
        We've received your payment response from PayFast. Your order will update once the payment notification is confirmed.
      </p>

      <div className="mt-6 space-y-2 text-sm">
        {orderId && (
          <p>
            <span className="font-semibold">Order ID:</span> {orderId}
          </p>
        )}
        {pfId && (
          <p>
            <span className="font-semibold">PayFast Ref:</span> {pfId}
          </p>
        )}
        {status && (
          <p>
            <span className="font-semibold">Status:</span> {status}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {orderId ? (
          <a
            href={`/order/${orderId}`}
            className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
          >
            View order
          </a>
        ) : null}
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-md border hover:bg-muted"
        >
          Continue shopping
        </a>
      </div>

      <div className="mt-8 rounded-md bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
        If this page does not reflect the final status immediately, it will update once the Instant Transaction Notification (ITN) from PayFast is processed.
      </div>
    </div>
  );
}
