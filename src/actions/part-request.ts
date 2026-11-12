"use server";

import { db } from "@/lib/db";
import { api, convexMutation, isConvexEnabled } from "@/lib/convex";

interface PartRequestInput {
  partName: string;
  partNumber?: string;
  vehicleDetails: string;
  userName: string;
  contactInfo: string;
}

export async function submitPartRequest({
  partName,
  partNumber,
  vehicleDetails,
  userName,
  contactInfo,
}: PartRequestInput) {
  try {
    if (isConvexEnabled()) {
      return await convexMutation(api.partRequests.submitPartRequest, {
        partName,
        partNumber: partNumber || undefined,
        vehicleDetails,
        userName,
        contactInfo,
      });
    }

    await db.partRequest.create({
      data: {
        partName,
        partNumber: partNumber || null,
        vehicleDetails,
        userName,
        contactInfo,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting part request:", error);
    return { success: false, error: "Failed to submit request." };
  }
}
