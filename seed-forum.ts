import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seedForumCategories() {
  console.log("🌱 Seeding forum categories...");

  const categories = [
    {
      name: "Engine & Performance",
      slug: "engine-performance",
      description:
        "Discuss engine modifications, performance upgrades, turbocharging, and mechanical issues.",
      icon: "🔧",
      color: "#EF4444",
      order: 1,
      subforums: [
        {
          name: "Engine Modifications",
          slug: "engine-modifications",
          description:
            "Share your engine mods, performance builds, and power upgrades.",
          order: 1,
        },
        {
          name: "Turbo & Supercharging",
          slug: "turbo-supercharging",
          description:
            "Everything about forced induction - turbos, superchargers, and boost.",
          order: 2,
        },
        {
          name: "Engine Diagnostics",
          slug: "engine-diagnostics",
          description: "Troubleshoot engine problems, CEL codes, and mechanical issues.",
          order: 3,
        },
      ],
    },
    {
      name: "Suspension & Handling",
      slug: "suspension-handling",
      description:
        "Talk about suspension setups, coilovers, sway bars, and handling improvements.",
      icon: "⚙️",
      color: "#3B82F6",
      order: 2,
      subforums: [
        {
          name: "Coilovers & Springs",
          slug: "coilovers-springs",
          description: "Discuss coilover setups, lowering springs, and ride height.",
          order: 1,
        },
        {
          name: "Alignment & Setup",
          slug: "alignment-setup",
          description: "Alignment specs, corner balancing, and handling setup.",
          order: 2,
        },
      ],
    },
    {
      name: "Brakes & Wheels",
      slug: "brakes-wheels",
      description:
        "Brake upgrades, wheel fitment, tire selection, and stopping power.",
      icon: "🛞",
      color: "#10B981",
      order: 3,
      subforums: [
        {
          name: "Brake Upgrades",
          slug: "brake-upgrades",
          description: "Big brake kits, pads, rotors, and brake line upgrades.",
          order: 1,
        },
        {
          name: "Wheels & Fitment",
          slug: "wheels-fitment",
          description: "Wheel specs, offset, fitment questions, and tire selection.",
          order: 2,
        },
      ],
    },
    {
      name: "Exhaust & Intake",
      slug: "exhaust-intake",
      description:
        "Exhaust systems, headers, intakes, and breathing modifications.",
      icon: "💨",
      color: "#F59E0B",
      order: 4,
      subforums: [
        {
          name: "Exhaust Systems",
          slug: "exhaust-systems",
          description: "Cat-backs, headers, downpipes, and exhaust sound clips.",
          order: 1,
        },
        {
          name: "Cold Air Intakes",
          slug: "cold-air-intakes",
          description: "Intake systems, filters, and air flow improvements.",
          order: 2,
        },
      ],
    },
    {
      name: "Electrical & Electronics",
      slug: "electrical-electronics",
      description:
        "Lighting, audio systems, electronics, wiring, and electrical troubleshooting.",
      icon: "⚡",
      color: "#8B5CF6",
      order: 5,
      subforums: [
        {
          name: "Lighting Upgrades",
          slug: "lighting-upgrades",
          description: "Headlights, tail lights, HID, LED, and lighting mods.",
          order: 1,
        },
        {
          name: "Audio & Electronics",
          slug: "audio-electronics",
          description: "Car audio, head units, speakers, and electronic accessories.",
          order: 2,
        },
      ],
    },
    {
      name: "Exterior & Aerodynamics",
      slug: "exterior-aerodynamics",
      description:
        "Body kits, spoilers, aero mods, paint, and exterior styling.",
      icon: "🎨",
      color: "#EC4899",
      order: 6,
      subforums: [
        {
          name: "Body Kits & Aero",
          slug: "body-kits-aero",
          description: "Body kits, spoilers, wings, and aerodynamic modifications.",
          order: 1,
        },
        {
          name: "Paint & Detailing",
          slug: "paint-detailing",
          description: "Paint jobs, wraps, detailing products, and car care.",
          order: 2,
        },
      ],
    },
    {
      name: "Interior & Comfort",
      slug: "interior-comfort",
      description: "Interior upgrades, seats, steering wheels, and comfort modifications.",
      icon: "🪑",
      color: "#06B6D4",
      order: 7,
      subforums: [
        {
          name: "Seats & Harnesses",
          slug: "seats-harnesses",
          description: "Racing seats, seat brackets, and harness installations.",
          order: 1,
        },
        {
          name: "Steering & Shifters",
          slug: "steering-shifters",
          description: "Steering wheels, short shifters, and shift knobs.",
          order: 2,
        },
      ],
    },
    {
      name: "Maintenance & DIY",
      slug: "maintenance-diy",
      description:
        "Regular maintenance, DIY guides, tool recommendations, and repair help.",
      icon: "🔨",
      color: "#84CC16",
      order: 8,
      subforums: [
        {
          name: "DIY Guides",
          slug: "diy-guides",
          description: "Step-by-step installation and maintenance guides.",
          order: 1,
        },
        {
          name: "Tool Talk",
          slug: "tool-talk",
          description: "Tool recommendations, shop equipment, and workspace setups.",
          order: 2,
        },
      ],
    },
    {
      name: "General Discussion",
      slug: "general-discussion",
      description:
        "Off-topic discussions, car meets, events, and general automotive chat.",
      icon: "💬",
      color: "#6B7280",
      order: 9,
      subforums: [
        {
          name: "Car Meets & Events",
          slug: "car-meets-events",
          description: "Discuss upcoming car meets, shows, and automotive events.",
          order: 1,
        },
        {
          name: "Off-Topic",
          slug: "off-topic",
          description: "Non-automotive discussions and general chat.",
          order: 2,
        },
      ],
    },
    {
      name: "Marketplace Discussions",
      slug: "marketplace-discussions",
      description:
        "Discuss parts buying/selling, price checks, and marketplace experiences.",
      icon: "🛒",
      color: "#F97316",
      order: 10,
      subforums: [
        {
          name: "Price Check",
          slug: "price-check",
          description: "Get opinions on fair prices for parts and vehicles.",
          order: 1,
        },
        {
          name: "Seller Reviews",
          slug: "seller-reviews",
          description: "Share your experiences with parts sellers and stores.",
          order: 2,
        },
      ],
    },
  ];

  for (const category of categories) {
    const { subforums, ...categoryData } = category;

    const createdCategory = await db.forumCategory.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });

    console.log(`✅ Created category: ${createdCategory.name}`);

    // Create subforums
    if (subforums && subforums.length > 0) {
      for (const subforum of subforums) {
        const createdSubforum = await db.forumSubforum.upsert({
          where: { slug: subforum.slug },
          update: {
            ...subforum,
            categoryId: createdCategory.id,
          },
          create: {
            ...subforum,
            categoryId: createdCategory.id,
          },
        });
        console.log(`  ✅ Created subforum: ${createdSubforum.name}`);
      }
    }
  }

  console.log("✨ Forum seeding completed!");
}

seedForumCategories()
  .catch((error) => {
    console.error("❌ Error seeding forum:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
