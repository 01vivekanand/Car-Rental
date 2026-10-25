import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./config/prisma";

const SAMPLE_VEHICLES = [
  { make: "Toyota", model: "Camry", category: "Sedan", price: 28500, quantity: 5, imageUrl: "/cars/camry.jpg" },
  { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 3, imageUrl: "/cars/crv.jpg" },
  { make: "Ford", model: "F-150", category: "Truck", price: 41000, quantity: 0, imageUrl: "/cars/f150.jpg" },
  { make: "Tesla", model: "Model 3", category: "Electric", price: 39990, quantity: 2, imageUrl: "/cars/model3.jpg" },
  { make: "Mazda", model: "MX-5", category: "Convertible", price: 31500, quantity: 4, imageUrl: "/cars/mx5.jpg" },
  { make: "Land Rover", model: "Defender", category: "SUV", price: 58000, quantity: 1, imageUrl: "/cars/defender.jpg" },
  { make: "Porsche", model: "911", category: "Coupe", price: 115000, quantity: 2, imageUrl: "/cars/911.jpg" },
  { make: "Hyundai", model: "Ioniq 5", category: "Electric", price: 43500, quantity: 6, imageUrl: "/cars/ioniq5.jpg" },
  { make: "BMW", model: "3 Series", category: "Sedan", price: 45000, quantity: 3, imageUrl: "/cars/bmw3.jpg" },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@dealership.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash: await bcrypt.hash(password, 10), role: "ADMIN" },
  });

  // Adds missing cars and sets image paths on existing ones, without touching their stock.
  for (const vehicle of SAMPLE_VEHICLES) {
    const existing = await prisma.vehicle.findFirst({
      where: { make: vehicle.make, model: vehicle.model },
    });
    if (existing) {
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: { imageUrl: vehicle.imageUrl },
      });
    } else {
      await prisma.vehicle.create({ data: vehicle });
    }
  }

  console.log(`Seeded admin ${email} and sample vehicles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());