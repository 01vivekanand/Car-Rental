import request from "supertest";
import { createApp } from "../app";
import { AuthService } from "../services/auth.service";
import {
  NewUser,
  UserRecord,
  UserRepository,
} from "../repositories/user.repository";

// Fake repository so these tests need no database.
class InMemoryUserRepository implements UserRepository {
  private users: UserRecord[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(data: NewUser) {
    const user: UserRecord = { id: this.users.length + 1, role: "USER", ...data };
    this.users.push(user);
    return user;
  }
}

const buildApp = () =>
  createApp(new AuthService(new InMemoryUserRepository(), "test-secret"));

const creds = { email: "a@b.com", password: "password123" };

describe("POST /api/auth/register", () => {
  it("creates a user and never returns the password hash", async () => {
    const res = await request(buildApp()).post("/api/auth/register").send(creds);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("a@b.com");
    expect(res.body.role).toBe("USER");
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ email: "nope", password: "123" });

    expect(res.status).toBe(400);
  });

  it("returns 409 for a duplicate email", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(creds);
    const res = await request(app).post("/api/auth/register").send(creds);

    expect(res.status).toBe(409);
  });

  it("ignores a role sent by the client", async () => {
    const res = await request(buildApp())
      .post("/api/auth/register")
      .send({ ...creds, role: "ADMIN" });

    expect(res.body.role).toBe("USER");
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token and user for valid credentials", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(creds);
    const res = await request(app).post("/api/auth/login").send(creds);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("a@b.com");
  });

  it("returns 401 for a wrong password", async () => {
    const app = buildApp();
    await request(app).post("/api/auth/register").send(creds);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...creds, password: "wrong-password" });

    expect(res.status).toBe(401);
  });
});