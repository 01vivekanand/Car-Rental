import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app";
import { AuthService } from "../services/auth.service";
import { VehicleService } from "../services/vehicle.service";
import { InMemoryVehicleRepository } from "../test-utils/in-memory-vehicle.repository";

const SECRET = "test-secret";

const buildApp = () =>
  createApp({
    auth: new AuthService({ findByEmail: jest.fn(), create: jest.fn() }, SECRET),
    vehicles: new VehicleService(new InMemoryVehicleRepository()),
    jwtSecret: SECRET,
  });

const bearer = (role: "USER" | "ADMIN") =>
  `Bearer ${jwt.sign({ sub: "1", role }, SECRET, { expiresIn: "1h" })}`;

const camry = { make: "Toyota", model: "Camry", category: "Sedan", price: 28500, quantity: 2 };
const crv = { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 1 };

async function addVehicle(app: ReturnType<typeof buildApp>, data = camry) {
  const res = await request(app)
    .post("/api/vehicles")
    .set("Authorization", bearer("ADMIN"))
    .send(data);
  return res.body as { id: number; quantity: number };
}

describe("authentication", () => {
  it("returns 401 without a token", async () => {
    const res = await request(buildApp()).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(buildApp())
      .get("/api/vehicles")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("POST and GET /api/vehicles", () => {

   it("saves and returns an image path", async () => {
  const res = await request(buildApp())
    .post("/api/vehicles")
    .set("Authorization", bearer("USER"))
    .send({ ...camry, imageUrl: "/cars/camry.jpg" });

  expect(res.status).toBe(201);
  expect(res.body.imageUrl).toBe("/cars/camry.jpg");
});



  it("creates a vehicle and lists it", async () => {
    const app = buildApp();
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", bearer("USER"))
      .send(camry);
    expect(created.status).toBe(201);
    expect(created.body.id).toBeDefined();

    const list = await request(app).get("/api/vehicles").set("Authorization", bearer("USER"));
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].make).toBe("Toyota");
  });

  it("returns 400 for a negative price", async () => {
    const res = await request(buildApp())
      .post("/api/vehicles")
      .set("Authorization", bearer("USER"))
      .send({ ...camry, price: -5 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/vehicles/search", () => {
  it("filters by make, category and price range", async () => {
    const app = buildApp();
    await addVehicle(app, camry);
    await addVehicle(app, crv);
    const auth = bearer("USER");

    const byMake = await request(app).get("/api/vehicles/search?make=toy").set("Authorization", auth);
    expect(byMake.body).toHaveLength(1);
    expect(byMake.body[0].model).toBe("Camry");

    const byCategory = await request(app).get("/api/vehicles/search?category=suv").set("Authorization", auth);
    expect(byCategory.body[0].model).toBe("CR-V");

    const byPrice = await request(app).get("/api/vehicles/search?minPrice=30000").set("Authorization", auth);
    expect(byPrice.body).toHaveLength(1);
    expect(byPrice.body[0].make).toBe("Honda");
  });

  it("returns 400 for a non-numeric price", async () => {
    const res = await request(buildApp())
      .get("/api/vehicles/search?minPrice=abc")
      .set("Authorization", bearer("USER"));
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/vehicles/:id", () => {
  it("updates a vehicle", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app);

    const res = await request(app)
      .put(`/api/vehicles/${id}`)
      .set("Authorization", bearer("USER"))
      .send({ price: 27000 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(27000);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(buildApp())
      .put("/api/vehicles/99")
      .set("Authorization", bearer("USER"))
      .send({ price: 1 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("returns 403 for a normal user", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app);

    const res = await request(app).delete(`/api/vehicles/${id}`).set("Authorization", bearer("USER"));
    expect(res.status).toBe(403);
  });

  it("lets an admin delete, then returns 404", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app);

    const first = await request(app).delete(`/api/vehicles/${id}`).set("Authorization", bearer("ADMIN"));
    expect(first.status).toBe(204);

    const second = await request(app).delete(`/api/vehicles/${id}`).set("Authorization", bearer("ADMIN"));
    expect(second.status).toBe(404);
  });
});

describe("POST /api/vehicles/:id/purchase", () => {
  it("decreases the quantity by one", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app, camry);

    const res = await request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set("Authorization", bearer("USER"));

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(1);
  });

  it("returns 409 once the stock reaches zero", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app, crv);
    const auth = bearer("USER");

    await request(app).post(`/api/vehicles/${id}/purchase`).set("Authorization", auth);
    const res = await request(app).post(`/api/vehicles/${id}/purchase`).set("Authorization", auth);

    expect(res.status).toBe(409);
  });

  it("returns 404 for an unknown vehicle", async () => {
    const res = await request(buildApp())
      .post("/api/vehicles/99/purchase")
      .set("Authorization", bearer("USER"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  it("returns 403 for a normal user", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app);

    const res = await request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set("Authorization", bearer("USER"))
      .send({ amount: 5 });
    expect(res.status).toBe(403);
  });

  it("lets an admin add stock", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app, camry);

    const res = await request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set("Authorization", bearer("ADMIN"))
      .send({ amount: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(7);
  });

  it("returns 400 for an invalid amount", async () => {
    const app = buildApp();
    const { id } = await addVehicle(app);

    const res = await request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set("Authorization", bearer("ADMIN"))
      .send({ amount: 0 });
    expect(res.status).toBe(400);
  });
});