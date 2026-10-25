import "dotenv/config";
import { createApp } from "./app";
import { AuthService } from "./services/auth.service";
import { VehicleService } from "./services/vehicle.service";
import { PrismaUserRepository } from "./repositories/prisma-user.repository";
import { PrismaVehicleRepository } from "./repositories/prisma-vehicle.repository";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

const app = createApp({
  auth: new AuthService(new PrismaUserRepository(), secret),
  vehicles: new VehicleService(new PrismaVehicleRepository()),
  jwtSecret: secret,
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));