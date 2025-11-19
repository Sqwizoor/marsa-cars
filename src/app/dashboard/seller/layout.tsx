import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { ensureSellerSubscription } from "@/lib/subscription-guard";
import { db } from "@/lib/db";

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non sellers from accessing the seller dashboard
  const user = await currentUser();

  if (!user) redirect("/");

  // Check role in DB to be sure (Clerk metadata might be stale)
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { 
      role: true,
      subscriptions: {
        where: {
          status: { in: ["ACTIVE", "TRIALING"] }
        }
      }
    },
  });

  const hasActiveSubscription = dbUser?.subscriptions && dbUser.subscriptions.length > 0;
  const isSeller = dbUser?.role === "SELLER" || user.privateMetadata.role === "SELLER";

  if (!isSeller && !hasActiveSubscription) {
    redirect("/");
  }

  try {
    await ensureSellerSubscription(user.id);
  } catch (error) {
    redirect("/subscriptions");
  }
  return <div>{children}</div>;
}
