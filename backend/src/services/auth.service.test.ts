import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  AuthService,
  EmailAlreadyUsedError,
  InvalidCredentialsError,
} from "./auth.service";
import { UserRepository } from "../repositories/user.repository";

// A fake repository, so these unit tests never touch the real database.
const makeRepo = (): jest.Mocked<UserRepository> => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
});

describe("AuthService.register", () => {
  it("hashes the password and saves the user", async () => {
    const repo = makeRepo();
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockImplementation(async (data) => ({
      id: 1,
      role: "USER" as const,
      ...data,
    }));
    const service = new AuthService(repo, "test-secret");

    const user = await service.register("a@b.com", "password123");

    expect(repo.create).toHaveBeenCalledTimes(1);
    const saved = repo.create.mock.calls[0][0];
    expect(saved.email).toBe("a@b.com");
    expect(saved.passwordHash).not.toBe("password123");
    expect(user.email).toBe("a@b.com");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects an email that is already registered", async () => {
    const repo = makeRepo();
    repo.findByEmail.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      passwordHash: "x",
      role: "USER",
    });
    const service = new AuthService(repo, "test-secret");

    await expect(service.register("a@b.com", "password123")).rejects.toThrow(
      EmailAlreadyUsedError
    );
    expect(repo.create).not.toHaveBeenCalled();
  });
});