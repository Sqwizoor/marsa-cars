#!/usr/bin/env node

// Direct database seed script for countries
import { db } from "./src/lib/db";
import countries from "./src/data/countries.json";

async function seed() {
  try {
    console.log("Starting country seeding...");
    let count = 0;

    for (const country of countries) {
      await db.country.upsert({
        where: {
          name: country.name,
        },
        create: {
          name: country.name,
          code: country.code,
        },
        update: {
          name: country.name,
          code: country.code,
        },
      });
      count++;
    }

    console.log(`✓ Successfully seeded ${count} countries`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding countries:", error);
    process.exit(1);
  }
}

seed();
