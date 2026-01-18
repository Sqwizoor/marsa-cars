import { db } from "./src/lib/db";

async function main() {
  try {
    const car = await db.carListing.findFirst();
    if (car) {
      /* Update the car to be sponsored and ensure it is active */
      await db.carListing.update({
        where: { id: car.id },
        data: { 
            isSponsored: true, 
            status: "ACTIVE" 
        }
      });
      console.log("Updated car [" + car.make + " " + car.model + "] to be sponsored.");
      
      /* Also ensure it has at least one image if possible, or check images */
      const images = await db.carImage.findMany({ where: { carListingId: car.id }});
      console.log("Car has " + images.length + " images.");

    } else {
        console.log("No cars found to update.");
    }
  } catch (e) {
    console.error(e);
  }
}

main();
