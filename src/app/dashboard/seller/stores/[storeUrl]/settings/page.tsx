import StoreDetails from "@/components/dashboard/forms/store-details";
import { StoreMembers } from "@/components/dashboard/forms/store-members";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Store, User } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function SellerStorePage(context: { params: Promise<{ storeUrl: string }> }) {
  const params = await context.params;
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const storeDetails = (await db.store.findUnique({
    where: {
      url: params.storeUrl,
    },
    include: {
      members: true,
    },
  })) as (Store & { members: User[] }) | null;

  if (!storeDetails) {
    redirect("/dashboard/seller/stores");
  }

  const isOwner = storeDetails.userId === user.id;
  const isMember = storeDetails.members.some((m) => m.id === user.id);

  if (!isOwner && !isMember) {
     redirect("/dashboard/seller/stores");
  }
  
  return (
    <div className="space-y-8">
      <StoreDetails data={storeDetails} />
      <StoreMembers 
        storeUrl={params.storeUrl} 
        members={storeDetails.members} 
        isOwner={isOwner} 
      />
    </div>
  );
}
