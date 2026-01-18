import { db } from "./src/lib/db";
import { FuelType, TransmissionType, CarCondition } from "@prisma/client";

const sampleCars = [
  {
    title: "2023 BMW 3 Series 320i M Sport",
    make: "BMW",
    model: "3 Series",
    year: 2023,
    variant: "320i M Sport",
    price: 850000,
    mileage: 12000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "Sedan",
    color: "Alpine White",
    province: "Gauteng",
    city: "Johannesburg",
    description: "Immaculate BMW 3 Series with full service history. M Sport package includes sports suspension, M steering wheel, and 18-inch alloy wheels.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2022 Mercedes-Benz C-Class C200",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    variant: "C200 AMG Line",
    price: 920000,
    mileage: 18000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "Sedan",
    color: "Obsidian Black",
    province: "Western Cape",
    city: "Cape Town",
    description: "Stunning Mercedes-Benz C-Class with AMG Line package. Features include digital cockpit, ambient lighting, and premium sound system.",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2021 Toyota Hilux 2.8 GD-6 Legend",
    make: "Toyota",
    model: "Hilux",
    year: 2021,
    variant: "2.8 GD-6 Legend 4x4",
    price: 720000,
    mileage: 45000,
    fuelType: FuelType.DIESEL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "Double Cab",
    color: "Glacier White",
    province: "KwaZulu-Natal",
    city: "Durban",
    description: "Reliable Toyota Hilux Legend with 4x4 capability. Perfect for both work and leisure. Includes leather seats and touchscreen infotainment.",
    images: [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2024 Volkswagen Polo 1.0 TSI Life",
    make: "Volkswagen",
    model: "Polo",
    year: 2024,
    variant: "1.0 TSI Life",
    price: 385000,
    mileage: 5000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.MANUAL,
    condition: CarCondition.USED,
    bodyType: "Hatchback",
    color: "Reef Blue",
    province: "Gauteng",
    city: "Pretoria",
    description: "Almost new Volkswagen Polo with balance of warranty. Features include Apple CarPlay, cruise control, and parking sensors.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2020 Ford Ranger 2.0 Bi-Turbo Wildtrak",
    make: "Ford",
    model: "Ranger",
    year: 2020,
    variant: "2.0 Bi-Turbo Wildtrak 4x4",
    price: 650000,
    mileage: 62000,
    fuelType: FuelType.DIESEL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "Double Cab",
    color: "Sea Grey",
    province: "Eastern Cape",
    city: "Port Elizabeth",
    description: "Ford Ranger Wildtrak with powerful bi-turbo engine. Includes SYNC 3 infotainment, adaptive cruise control, and lane-keeping assist.",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2023 Audi A4 2.0 TFSI S Line",
    make: "Audi",
    model: "A4",
    year: 2023,
    variant: "2.0 TFSI S Line",
    price: 780000,
    mileage: 15000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "Sedan",
    color: "Mythos Black",
    province: "Gauteng",
    city: "Sandton",
    description: "Elegant Audi A4 with S Line exterior and interior package. Virtual cockpit, Matrix LED headlights, and Bang & Olufsen sound system.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2022 Hyundai Tucson 2.0 Executive",
    make: "Hyundai",
    model: "Tucson",
    year: 2022,
    variant: "2.0 Executive",
    price: 520000,
    mileage: 28000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "SUV",
    color: "Amazon Grey",
    province: "Free State",
    city: "Bloemfontein",
    description: "Spacious Hyundai Tucson with bold design. Features panoramic sunroof, heated seats, and comprehensive safety features.",
    images: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop",
    ],
  },
  {
    title: "2021 Mazda CX-5 2.0 Dynamic",
    make: "Mazda",
    model: "CX-5",
    year: 2021,
    variant: "2.0 Dynamic",
    price: 480000,
    mileage: 35000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    condition: CarCondition.USED,
    bodyType: "SUV",
    color: "Soul Red Crystal",
    province: "Mpumalanga",
    city: "Nelspruit",
    description: "Beautiful Mazda CX-5 in signature Soul Red. Kodo design, premium Bose audio, and excellent fuel efficiency.",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
    ],
  },
];

async function main() {
  console.log("Starting car seed...");

  // Get or create a user to associate with these listings
  let user = await db.user.findFirst();
  
  if (!user) {
    console.log("No user found. Please create a user first.");
    return;
  }

  console.log("Found user:", user.name);

  // Get or create a subscription for this user
  let subscription = await db.carSubscription.findFirst({
    where: { userId: user.id }
  });

  if (!subscription) {
    subscription = await db.carSubscription.create({
      data: {
        userId: user.id,
        tier: "DEALER",
        status: "ACTIVE",
        amount: 0,
        listingLimit: 100,
        listingsUsed: 0,
        sponsoredLimit: 20,
        sponsoredUsed: 0,
        sellerType: "DEALER",
      }
    });
    console.log("Created subscription for user");
  }

  // Create car listings
  for (const car of sampleCars) {
    const slug = `${car.make}-${car.model}-${car.year}-${Date.now().toString(36)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const listing = await db.carListing.create({
      data: {
        title: car.title,
        make: car.make,
        model: car.model,
        year: car.year,
        variant: car.variant,
        price: car.price,
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        condition: car.condition,
        bodyType: car.bodyType,
        color: car.color,
        province: car.province,
        city: car.city,
        description: car.description,
        slug,
        status: "ACTIVE",
        isSponsored: true,
        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user.id,
        carSubscriptionId: subscription.id,
        features: ["ABS", "Airbags", "Air Conditioning", "Bluetooth", "Cruise Control"],
        images: {
          create: car.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            order: index,
          }))
        }
      }
    });
    
    console.log(`Created: ${listing.title}`);
  }

  // Update subscription usage
  await db.carSubscription.update({
    where: { id: subscription.id },
    data: {
      listingsUsed: { increment: sampleCars.length },
      sponsoredUsed: { increment: sampleCars.length },
    }
  });

  console.log(`\nSeeded ${sampleCars.length} car listings with images!`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
