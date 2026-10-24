import bcrypt from "bcryptjs";
import { UserRecord, UserRepository } from "../repositories/user.repository";

export class EmailAlreadyUsedError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "EmailAlreadyUsedError";
  }
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  /** Creates a new user with a hashed password. Never returns the hash. */
  async register(email: string, password: string): Promise<PublicUser> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyUsedError();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { passwordHash: _hash, ...publicUser } = await this.users.create({
      email,
      passwordHash,
    });
    return publicUser;
  }
}