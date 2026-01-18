import { db } from "./src/lib/db";

async function main() {
  try {
    const sponsoredCars = await db.carListing.findMany({
      where: {
        isSponsored: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        isSponsored: true,
        status: true,
      }
    });

    console.log("Found sponsored cars:", sponsoredCars.length);
    console.log(JSON.stringify(sponsoredCars, null, 2));

    const allCars = await db.carListing.count();
    console.log("Total cars:", allCars);
  } catch (e) {
    console.error(e);
  }
}

main();
