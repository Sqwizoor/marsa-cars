
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedArticles() {
  console.log("Seeding articles...");

  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("No user found to assign articles to. Please seed users first.");
    return;
  }

  const articles = [
    {
      title: "The Future of Electric Vehicles: What to Expect in 2026",
      slug: "future-of-electric-vehicles-2026",
      content: "Electric vehicles are taking over the world. With new battery technologies and faster charging speeds, the future looks bright. The automotive industry is witnessing a paradigm shift as major manufacturers pledge to go fully electric within the next decade. \n\nConsumers can expect longer ranges, shorter charging times, and more affordable options. The infrastructure for charging stations is also expanding rapidly, making EV ownership more convenient than ever before. In 2026, we anticipate the release of several groundbreaking models that will redefine performance and luxury in the electric segment.",
      excerpt: "Explore the upcoming trends in the EV market and what they mean for consumers.",
      coverImage: "/assets/images/home-wallpaper-1.jpg",
      published: true,
      publishedAt: new Date(),
      tags: ["EV", "Future", "Technology"],
      authorId: user.id,
    },
    {
      title: "Top 10 SUVs for Family Road Trips",
      slug: "top-10-suvs-family-road-trips",
      content: "Planning a road trip with the family? Here are the best SUVs that offer comfort, safety, and plenty of space. When choosing the perfect vehicle for long journeys, factors such as cargo capacity, fuel efficiency, and entertainment features become crucial. \n\nOur top picks include models known for their reliability and spacious interiors. Whether you're heading to the mountains or the coast, these SUVs ensure that everyone travels in comfort. Safety features like lane-keeping assist and adaptive cruise control are standard in many of these top-rated comparisons.",
      excerpt: "Discover the best SUVs that make long journeys comfortable and safe for the whole family.",
      coverImage: "/assets/images/home-wallpaper-2.jpg",
      published: true,
      publishedAt: new Date(),
      tags: ["SUV", "Family", "Road Trip"],
      authorId: user.id,
    },
    {
      title: "Maintenance Tips to Keep Your Car Running Forever",
      slug: "maintenance-tips-car-running-forever",
      content: "Regular maintenance is key to a long-lasting vehicle. Learn about oil changes, tire rotations, and more. Neglecting simple checks can lead to expensive repairs down the line. \n\nIt is recommended to check your oil levels monthly and tire pressure every couple of weeks. Keeping your car clean, both inside and out, also helps preserve its value. Don't forget to service your brakes and check your fluid levels regularly. A well-maintained car not only runs better but also ensures your safety on the road.",
      excerpt: "Essential maintenance tips to extend the life of your vehicle and avoid costly repairs.",
      coverImage: "/assets/images/home-wallpaper-3.jpg",
      published: true,
      publishedAt: new Date(),
      tags: ["Maintenance", "Tips", "Car Care"],
      authorId: user.id,
    },
    {
      title: "Classic Cars: A Guide to Investing",
      slug: "classic-cars-guide-investing",
      content: "Investing in classic cars can be lucrative if you know what to look for. Here is a beginner's guide. The market for vintage automobiles has seen steady growth, with certain models appreciating significantly in value. \n\nWhen considering an investment, authenticity and condition are paramount. Restored vehicles can fetch high prices, but original, low-mileage examples are often the most sought after. Research is essential—knowing production numbers, historical significance, and market trends will help you make informed decisions.",
      excerpt: "Learn the basics of investing in classic cars and which models are appreciating in value.",
      coverImage: "/assets/images/home-wallpaper-4.jpg",
      published: true,
      publishedAt: new Date(),
      tags: ["Classic Cars", "Investing", "Vintage"],
      authorId: user.id,
    },
  ];

  for (const article of articles) {
    const { title, slug, content, excerpt, coverImage, published, publishedAt, tags, authorId } = article;
    await prisma.article.upsert({
      where: { slug: slug },
      update: {
        title,
        content,
        excerpt,
        coverImage,
        published,
        publishedAt,
        tags,
        authorId
      },
      create: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        publishedAt,
        tags,
        authorId
      },
    });
    console.log(`Upserted article: ${article.title}`);
  }

  console.log("Seeding complete.");
}

seedArticles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
