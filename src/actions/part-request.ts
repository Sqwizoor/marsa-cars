
"use server";

import { db } from "@/lib/db";

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
