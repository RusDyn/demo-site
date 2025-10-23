import { ensureUser, prisma } from "../lib/prisma";

async function seed(): Promise<void> {
  await ensureUser({
    email: "demo@example.com",
    name: "Demo User",
    emailVerified: new Date(),
  });
}

try {
  await seed();
} catch (error) {
  console.error("Seed failed", error);
  process.exit(1);
} finally {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await prisma.$disconnect();
}
