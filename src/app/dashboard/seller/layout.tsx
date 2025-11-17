import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { ensureSellerSubscription } from "@/lib/subscription-guard";

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non sellers from accessing the seller dashboard
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "SELLER") redirect("/");

  try {
    await ensureSellerSubscription(user.id);
  } catch (error) {
    redirect("/subscriptions");
  }
  return <div>{children}</div>;
}
