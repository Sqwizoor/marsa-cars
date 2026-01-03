"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Store } from "@prisma/client";

// Function: getStoreMembers
// Description: Retrieves all members for a specific store.
export const getStoreMembers = async (storeUrl: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const store = (await db.store.findUnique({
      where: { url: storeUrl },
      include: {
        members: true,
      },
    })) as (Store & { members: any[] }) | null;

    if (!store) throw new Error("Store not found.");

    // Only owner or members can view members
    const isMember = store.members.some((m) => m.id === user.id);
    if (store.userId !== user.id && !isMember) {
      throw new Error("Unauthorized Access.");
    }

    return store.members;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Function: addStoreMember
// Description: Adds a member to the store by email.
export const addStoreMember = async (storeUrl: string, email: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });

    if (!store) throw new Error("Store not found.");

    // Only owner can add members
    if (store.userId !== user.id) {
      throw new Error("Only the store owner can add members.");
    }

    const memberUser = await db.user.findUnique({
      where: { email },
    });

    if (!memberUser) {
      throw new Error("User with this email not found. Please ask them to sign up first.");
    }

    if (memberUser.id === user.id) {
      throw new Error("You are already the owner of this store.");
    }

    // Check if already a member
    const existingMember = await db.store.findFirst({
        where: {
            id: store.id,
            members: {
                some: {
                    id: memberUser.id
                }
            }
        }
    });

    if (existingMember) {
        throw new Error("User is already a member of this store.");
    }

    await db.store.update({
      where: { id: store.id },
      data: {
        members: {
          connect: { id: memberUser.id },
        },
      },
    });

    return { success: true, message: "Member added successfully." };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Function: removeStoreMember
// Description: Removes a member from the store.
export const removeStoreMember = async (storeUrl: string, memberId: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });

    if (!store) throw new Error("Store not found.");

    // Only owner can remove members
    if (store.userId !== user.id) {
        // Allow members to leave? Maybe later. For now only owner removes.
        // If member wants to leave, they can theoretically use this if we change logic,
        // but typically "removeStoreMember" implies admin action.
        throw new Error("Only the store owner can remove members.");
    }

    await db.store.update({
      where: { id: store.id },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    return { success: true, message: "Member removed successfully." };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
