import "dotenv/config";
import { createApp } from "./app";
import { AuthService } from "./services/auth.service";
import { PrismaUserRepository } from "./repositories/prisma-user.repository";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

const app = createApp(new AuthService(new PrismaUserRepository(), secret));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));