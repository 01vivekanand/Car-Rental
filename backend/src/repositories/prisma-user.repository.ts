import { prisma } from "../config/prisma";
import { NewUser, UserRecord, UserRepository } from "./user.repository";

/** MySQL-backed user storage via Prisma. */
export class PrismaUserRepository implements UserRepository {
  findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  create(data: NewUser): Promise<UserRecord> {
    return prisma.user.create({ data });
  }
}