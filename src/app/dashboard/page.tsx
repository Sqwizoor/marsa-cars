



import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  //Get user and redirect depending on role
  const user = await currentUser();
  if (!user?.privateMetadata?.role || user?.privateMetadata.role === "USER")
    redirect("/");

  if (user.privateMetadata?.role === "ADMIN") redirect("/dashboard/admin");
  if (user.privateMetadata?.role === "SELLER") redirect("/dashboard/seller");
}