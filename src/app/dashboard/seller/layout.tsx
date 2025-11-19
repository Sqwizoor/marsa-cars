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
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "SELLER") {
    // Fallback to metadata if DB check fails (unlikely but safe)
    if (user.privateMetadata.role !== "SELLER") {
      redirect("/");
    }
  }

  try {
    await ensureSellerSubscription(user.id);
  } catch (error) {
    redirect("/subscriptions");
  }
  return <div>{children}</div>;
}
