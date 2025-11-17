import { PrismaClient } from "@prisma/client";
import countriesData from "../src/data/countries.json";

const prisma = new PrismaClient();

export async function seedCountries() {
  console.log("Starting to seed countries...");

  try {
    // Check if countries already exist
    const existingCount = await prisma.country.count();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing countries. Skipping seed.`);
      return;
    }

    // Seed countries from JSON file
    for (const country of countriesData) {
      await prisma.country.create({
        data: {
          name: country.name,
          code: country.code,
        },
      });
    }

    console.log(`Successfully seeded ${countriesData.length} countries!`);
  } catch (error) {
    console.error("Error seeding countries:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedCountries()
    .then(() => {
      console.log("Seed completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
