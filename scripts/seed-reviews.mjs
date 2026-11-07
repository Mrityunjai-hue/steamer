import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialReviews = [
  {
    userName: "Aryan Sharma",
    rating: 5,
    title: "Working directly on my Steam account! Super easy",
    comment: "Setup was genuinely under 10 minutes. Followed the step-by-step walkthrough, and Call of Duty: Modern Warfare II and Spider-Man were running offline without a hitch. Local save files are untouched.",
    gameTitle: "Call of Duty: Modern Warfare II",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    userName: "Siddharth Malhotra",
    rating: 5,
    title: "Saved over ₹15,000 instead of buying individual games",
    comment: "Honestly was skeptical at first, but ₹300 for the whole 265+ vault is insane value. Black Myth Wukong and God of War are working smoothly on my PC. Admin WhatsApp support was fast when I had a quick question.",
    gameTitle: "Black Myth: Wukong",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    userName: "Rohit P.",
    rating: 5,
    title: "100% genuine offline setup. Zero account sharing drama",
    comment: "Previous shared accounts on other sites kept kicking me out mid-mission. With Steamer's setup guide, you play offline forever on your own Steam account without collisions. Best 300 rupees spent.",
    gameTitle: "Grand Theft Auto V",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    userName: "Karan Verma",
    rating: 5,
    title: "Sekiro & Elden Ring working like a charm",
    comment: "The guide is click-by-click with visual screenshots. Anyone who can follow 4 steps can get it running. Verified my UTR within 2 minutes and guide unlocked immediately.",
    gameTitle: "Sekiro: Shadows Die Twice",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    userName: "Aditya N.",
    rating: 5,
    title: "Ghost of Tsushima looks breathtaking",
    comment: "Setup was buttery smooth. Played 8 hours straight without any crash or prompt. Definitely recommending to all my college friends.",
    gameTitle: "Ghost of Tsushima Director's Cut",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

async function main() {
  console.log("Seeding initial verified gamer reviews...");
  const existing = await prisma.review.count();
  if (existing === 0) {
    for (const r of initialReviews) {
      await prisma.review.create({ data: r });
    }
    console.log(`Seeded ${initialReviews.length} verified reviews.`);
  } else {
    console.log(`Reviews table already contains ${existing} records.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

