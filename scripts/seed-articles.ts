import "dotenv/config";
import { db } from "../src/lib/db";

async function seedArticles() {
  try {
    console.log("Seeding articles...");

    // Find or create an admin/author user
    let author = await db.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!author) {
        author = await db.user.findFirst();
        if (!author) {
            console.log("No user found to assign as author. Creating one...");
            try {
                 author = await db.user.create({
                    data: {
                        name: "Cars App Editor",
                        email: "editor@carsapp.com",
                        picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                        role: "ADMIN"
                    }
                });
            } catch (e) {
                // If creating fails (unique constraint), just get any user or user logic
                 console.log("Could not create user, creating minimalist user for seeding");
                 // fallback if needed
            }
        }
    }

    if (!author) {
        console.error("Could not find or create an author. Please creates a user first.");
        process.exit(1);
    }

    const articles = [
      {
        title: "2025 EV Market Outlook: What to Expect",
        slug: "2025-ev-market-outlook",
        excerpt: "Electric vehicles are taking over. Here's a comprehensive look at the upcoming models and market trends for 2025.",
        content: `
          <h2>The Electric Revolution Accelerates</h2>
          <p>As we approach 2025, the automotive landscape is shifting dramatically. Major manufacturers are committing to fully electric lineups, and infrastructure is catching up.</p>
          <h3>Key Trends</h3>
          <ul>
            <li><strong>Solid-state batteries:</strong> Promising longer range and faster charging.</li>
            <li><strong>Affordable options:</strong> More EVs under $30,000 are hitting the market.</li>
            <li><strong>Charging networks:</strong> Expansion of fast-charging stations nationwide.</li>
          </ul>
          <p>Stay tuned as we review the top contenders in the EV space next month.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000",
        published: true,
        publishedAt: new Date(),
        tags: ["EV", "Market Trends", "Future Tech"],
        authorId: author.id
      },
      {
        title: "Top 10 SUVs for Families in 2024",
        slug: "top-10-suvs-families-2024",
        excerpt: "Looking for the perfect family hauler? We've tested the best SUVs on the market to help you decide.",
        content: `
          <h2>Choosing the Right SUV</h2>
          <p>Family SUVs need to balance safety, space, and efficiency. Our top picks for 2024 excel in all these areas.</p>
          <h3>1. The All-Rounder</h3>
          <p>The new Highlander Hybrid offers incredible fuel economy without sacrificing space.</p>
          <h3>2. The Luxury Choice</h3>
          <p>For those who want premium comfort, the BMW X5 remains a benchmark.</p>
          <p>Read our full detailed reviews for each model in our dedicated reviews section.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
        published: true,
        publishedAt: new Date(Date.now() - 86400000), // Yesterday
        tags: ["SUV", "Family Cars", "Reviews"],
        authorId: author.id
      },
      {
        title: "Maintenance Tips: How to Extend Your Car's Life",
        slug: "car-maintenance-tips-extend-life",
        excerpt: "Simple habits can keep your car running smoothly for years. Learn the essential maintenance checks every owner should know.",
        content: `
          <h2>Regular Maintenance is Key</h2>
          <p>Ignoring maintenance can lead to costly repairs down the road. Here are simple steps to keep your car healthy.</p>
          <h3>Check Your Fluids</h3>
          <p>Oil, coolant, and brake fluid levels should be checked monthly.</p>
          <h3>Tire Care</h3>
          <p>Rotate your tires every 5,000 miles to ensure even wear and better handling.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=1000",
        published: true,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        tags: ["Maintenance", "Tips", "DIY"],
        authorId: author.id
      },
      {
        title: "Classic Cars: Investing in Vintage Iron",
        slug: "investing-in-classic-cars",
        excerpt: "Vintage cars aren't just for show; they can be a solid investment. Here's a guide to starting your collection.",
        content: `
          <h2>The Allure of Classics</h2>
          <p>Classic cars offer a driving experience that modern vehicles can't match. But are they a good investment?</p>
          <p>Models from the 90s are currently seeing a surge in value. Look for original condition and low mileage.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
        published: true,
        publishedAt: new Date(Date.now() - 259200000), // 3 days ago
        tags: ["Classic Cars", "Investment", "Vintage"],
        authorId: author.id
      }
    ];

    for (const article of articles) {
      await db.article.upsert({
        where: { slug: article.slug },
        update: {},
        create: article
      });
    }

    console.log(`✓ Successfully seeded ${articles.length} articles`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding articles:", error);
    process.exit(1);
  }
}

seedArticles();
