import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

// This is a temporary API route to fix your database
export async function GET() {
  try {
    // Delete all stores with null user relations
    const deletedStores = await db.store.deleteMany({
      where: {
        userId: Prisma.DbNull,
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedStores.count} corrupted stores`,
    })
  } catch (error: any) {
    console.error("Error fixing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}