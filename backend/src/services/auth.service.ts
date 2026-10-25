import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRecord, UserRepository } from "../repositories/user.repository";

export class EmailAlreadyUsedError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "EmailAlreadyUsedError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

const toPublicUser = (user: UserRecord): PublicUser => {
  const { passwordHash: _hash, ...publicUser } = user;
  return publicUser;
};

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtSecret: string
  ) {}

  /** Creates a new user with a hashed password. Never returns the hash. */
  async register(email: string, password: string): Promise<PublicUser> {
  const existing = await this.users.findByEmail(email);
  if (existing) {
    throw new EmailAlreadyUsedError();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await this.users.create({ email, passwordHash });
  return toPublicUser(created);
}

  /** Verifies credentials and returns a signed JWT plus the public user. */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const token = jwt.sign({ sub: String(user.id), role: user.role }, this.jwtSecret, {
      expiresIn: "1h",
    });
    return { token, user: toPublicUser(user) };
  }
}