import { seedCountries } from "@/migration-scripts/seed-countries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedCountries();
    return NextResponse.json(
      { message: "Countries seeded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error seeding countries:", error);
    return NextResponse.json(
      { error: "Failed to seed countries", details: String(error) },
      { status: 500 }
    );
  }
}
