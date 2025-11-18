import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import PaymentProcessing from "@/components/store/apply/payment-processing";
// import MinimalHeader from "@/components/store/layout/minimal-header/header";

export default async function SellerApplySuccessPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const store = await db.store.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!store) {
    // Check if there is a pending application
    const application = await db.storeApplication.findUnique({
      where: { userId: user.id },
    });

    if (application) {
      // Payment is likely still processing
      return <PaymentProcessing />;
    }

    // If somehow no store exists yet AND no application, send them back to apply flow
    redirect("/seller/apply");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-16">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
            <svg
              className="h-7 w-7 text-emerald-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="text-center text-2xl font-semibold sm:text-3xl">
            Your store trial is live welcome to Marsa Cars
          </h1>

          <p className="mt-3 text-center text-sm text-slate-600">
            You"&apos;ve successfully paid your R10 trial fee and your store is now created.
            You can start adding products and setting up your seller profile.
          </p>

          <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[1.6fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Store overview
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {store.name}
              </h2>
              <p className="text-xs text-slate-500">
                {store.url}.marsa.cars
              </p>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                {store.description}
              </p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Next steps
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li> Add your first products and images</li>
                <li> Fine-tune your shipping and return policy</li>
                <li> Share your store link with your audience</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/dashboard`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Go to seller dashboard
            </a>
            <a
              href={`/store/${store.url}`}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              View my public store
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
