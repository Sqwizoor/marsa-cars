"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function getPartRequests() {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthenticated");

        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });
        if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

        return await db.partRequest.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching part requests:", error);
        return [];
    }
}

export async function updatePartRequestStatus(id: string, status: string) {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthenticated");

        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });
        if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

        return await db.partRequest.update({
            where: { id },
            data: { status }
        });
    } catch (error) {
        console.error("Error updating part request:", error);
        throw error;
    }
}

export async function deletePartRequest(id: string) {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthenticated");

        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });
        if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

        return await db.partRequest.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Error deleting part request:", error);
        throw error;
    }
}
