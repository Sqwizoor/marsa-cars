
import { db } from "./src/lib/db";
import { v4 as uuidv4 } from 'uuid';

// Helper to generate random number between min and max
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate random date within last n days
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  // Randomize time too
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
};

// Helper to pick random element from array
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Failed"];

async function seedAnalytics() {
  console.log("🌱 Starting analytics seeding...");

  try {
    // 1. Get or Create a Store
    const targetStoreUrl = "porche-shockklk";
    let store = await db.store.findUnique({ where: { url: targetStoreUrl } });
    
    if (!store) {
        console.log(`Store '${targetStoreUrl}' not found, falling back to first available store...`);
        store = await db.store.findFirst();
    } else {
        console.log(`Found target store: ${store.name} (${store.url})`);
    }

    let user = await db.user.findFirst();

    if (!user) {
        console.log("Creating a default user...");
        user = await db.user.create({
            data: {
                name: "Demo Admin",
                email: "demo@example.com",
                picture: "https://github.com/shadcn.png",
                role: "ADMIN"
            }
        });
    }

    if (!store) {
      console.log("Creating a default store...");
      store = await db.store.create({
        data: {
          name: "Demo Store",
          description: "A store for demo purposes",
          email: "store@demo.com",
          phone: "1234567890",
          url: "demo-store",
          logo: "https://github.com/shadcn.png",
          cover: "https://github.com/shadcn.png",
          status: "ACTIVE",
          userId: user.id
        }
      });
    }

    // 2. Get or Create Products
    let products = await db.product.findMany({
        where: { storeId: store.id },
        include: { variants: { include: { sizes: true } } }
    });

    if (products.length === 0) {
        console.log("Creating demo products...");
        // Create a category first
        const category = await db.category.create({
            data: {
                name: "Demo Category",
                image: "https://github.com/shadcn.png",
                url: "demo-category-" + uuidv4(),
            }
        });
        
        const subCategory = await db.subCategory.create({
            data: {
                name: "Demo SubCategory",
                image: "https://github.com/shadcn.png",
                url: "demo-subcategory-" + uuidv4(),
                categoryId: category.id
            }
        });

        // Create 5 products
        for (let i = 0; i < 5; i++) {
            const product = await db.product.create({
                data: {
                    name: `Demo Product ${i + 1}`,
                    description: "This is a demo product",
                    slug: `demo-product-${i + 1}-${uuidv4()}`,
                    brand: "Demo Brand",
                    storeId: store.id,
                    categoryId: category.id,
                    subCategoryId: subCategory.id,
                    variants: {
                        create: {
                            variantName: "Default",
                            variantImage: "https://github.com/shadcn.png",
                            slug: `demo-variant-${i + 1}-${uuidv4()}`,
                            sku: `SKU-${i + 1}`,
                            keywords: "demo",
                            weight: 1,
                            sizes: {
                                create: {
                                    size: "M",
                                    quantity: 100,
                                    price: randomInt(100, 1000),
                                }
                            }
                        }
                    }
                },
                include: { variants: { include: { sizes: true } } }
            });
            products.push(product);
        }
    }

    // 3. Create Customers (Users)
    console.log("Creating customers...");
    const customers = [];
    for (let i = 0; i < 20; i++) {
        const firstName = randomChoice(FIRST_NAMES);
        const lastName = randomChoice(LAST_NAMES);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 9999)}@example.com`;
        
        // Check if user exists
        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            customers.push(existing);
            continue;
        }

        const customer = await db.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: email,
                picture: "https://github.com/shadcn.png",
                role: "USER",
                createdAt: randomDate(90) // Joined in last 90 days
            }
        });
        customers.push(customer);
    }

    // 4. Create Orders
    console.log("Creating orders...");
    const country = await db.country.findFirst() || await db.country.create({ data: { name: "South Africa", code: "ZA" } });

    for (let i = 0; i < 50; i++) {
        const customer = randomChoice(customers);
        const orderDate = randomDate(60); // Orders in last 60 days
        const status = randomChoice(ORDER_STATUSES) as any;
        const paymentStatus = randomChoice(PAYMENT_STATUSES) as any;
        
        // Create shipping address
        const address = await db.shippingAddress.create({
            data: {
                firstName: customer.name.split(" ")[0],
                lastName: customer.name.split(" ")[1],
                phone: "1234567890",
                address1: "123 Demo St",
                city: "Cape Town",
                state: "Western Cape",
                zip_code: "8001",
                countryId: country.id,
                userId: customer.id
            }
        });

        // Pick 1-3 random products
        const numItems = randomInt(1, 3);
        const orderItemsData = [];
        let subTotal = 0;

        for (let j = 0; j < numItems; j++) {
            const product = randomChoice(products);
            const variant = product.variants[0];
            const size = variant.sizes[0];
            const quantity = randomInt(1, 3);
            const price = size.price;
            const totalPrice = price * quantity;

            orderItemsData.push({
                productId: product.id,
                variantId: variant.id,
                sizeId: size.id,
                productSlug: product.slug,
                variantSlug: variant.slug,
                sku: variant.sku,
                name: product.name,
                image: variant.variantImage,
                size: size.size,
                quantity: quantity,
                price: price,
                totalPrice: totalPrice,
                status: (status === "Delivered" ? "Delivered" : "Pending") as any
            });

            subTotal += totalPrice;
        }

        const shippingFees = 100;
        const total = subTotal + shippingFees;

        // Create Order
        const order = await db.order.create({
            data: {
                userId: customer.id,
                shippingAddressId: address.id,
                shippingFees,
                subTotal,
                total,
                orderStatus: status,
                paymentStatus: paymentStatus,
                createdAt: orderDate,
                updatedAt: orderDate,
                groups: {
                    create: {
                        storeId: store!.id,
                        status: status,
                        shippingService: "Standard",
                        shippingDeliveryMin: 3,
                        shippingDeliveryMax: 5,
                        shippingFees,
                        subTotal,
                        total,
                        createdAt: orderDate,
                        updatedAt: orderDate,
                        items: {
                            create: orderItemsData.map(item => ({
                                ...item,
                                createdAt: orderDate,
                                updatedAt: orderDate
                            }))
                        }
                    }
                }
            }
        });
    }

    console.log("✅ Analytics seeding completed!");
    console.log(`Generated ${customers.length} customers and 50 orders.`);

  } catch (error) {
    console.error("❌ Error seeding analytics:", error);
  }
}

seedAnalytics();
