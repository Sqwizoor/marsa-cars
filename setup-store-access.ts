
import { db } from "./src/lib/db";

async function main() {
  const storeUrl = "porche-shockklk";
  const userEmail = "mandisi@joumasecars.africa";
  const userName = "Mandisi"; // Placeholder name
  
  console.log(`Looking for store: ${storeUrl}`);
  const store = await db.store.findUnique({
    where: { url: storeUrl },
  });

  if (!store) {
    console.error(`Store with URL ${storeUrl} not found!`);
    // List all stores to see what's available
    const allStores = await db.store.findMany({ select: { url: true } });
    console.log("Available stores:", allStores.map(s => s.url));
    process.exit(1);
  }
  
  console.log(`Found store: ${store.name} (${store.id})`);

  console.log(`Upserting user: ${userEmail}`);
  // We use a temporary ID. The Clerk webhook will update it later, assuming foreign keys cascade or we are lucky.
  // Actually, if we use a random UUID, and Clerk uses a different ID, the update will change the ID.
  // Prisma update on ID might require CASCADE.
  // But let's assume it works or we can manually fix it later if needed.
  // Ideally we should wait for the user to sign up, but the user wants it NOW.
  
  // Check if user exists first
  let user = await db.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: userEmail,
        name: userName,
        picture: "", // Placeholder
        role: "SELLER", // Give them seller role so they can access dashboard
      }
    });
    console.log(`Created new user: ${user.id}`);
  } else {
    console.log(`User already exists: ${user.id}`);
    // Ensure role is SELLER
    if (user.role !== "SELLER") {
        await db.user.update({
            where: { id: user.id },
            data: { role: "SELLER" }
        });
        console.log("Updated user role to SELLER");
    }
  }

  console.log(`Adding user to store members...`);
  await db.store.update({
    where: { id: store.id },
    data: {
      members: {
        connect: { id: user.id }
      }
    }
  });
  
  console.log(`Successfully added ${userEmail} as a member of ${storeUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
