import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// This is a temporary API route to fix your database
export async function GET() {
  try {
    // Delete all stores with null user relations
    const deletedStores = await db.store.deleteMany({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: null as any,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedStores.count} corrupted stores`,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fixing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}