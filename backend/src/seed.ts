import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./config/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@dealership.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash: await bcrypt.hash(password, 10), role: "ADMIN" },
  });

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({
      data: [
        { make: "Toyota", model: "Camry", category: "Sedan", price: 28500, quantity: 5 },
        { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 3 },
        { make: "Ford", model: "F-150", category: "Truck", price: 41000, quantity: 0 },
        { make: "Tesla", model: "Model 3", category: "Electric", price: 39990, quantity: 2 },
      ],
    });
  }

  console.log(`Seeded admin ${email} and sample vehicles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());