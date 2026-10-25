import { NextFunction, Request, Response, Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { NewVehicle } from "../repositories/vehicle.repository";
import {
  NewVehicleInput,
  VehicleService,
  VehicleValidationError,
} from "../services/vehicle.service";

const parseId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new VehicleValidationError("Invalid vehicle id");
  }
  return id;
};

const optionalNumber = (value: unknown, name: string): number | undefined => {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new VehicleValidationError(`${name} must be a number`);
  }
  return parsed;
};

const optionalText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/** Keeps only the fields a client is allowed to set. */
const pickVehicleFields = (body: Record<string, unknown> | undefined) => {
  const picked: Record<string, unknown> = {};
  for (const key of ["make", "model", "category", "price", "quantity"]) {
    if (body?.[key] !== undefined) picked[key] = body[key];
  }
  return picked;
};

/** Passes async errors to the central error handler. */
const handle =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

export function createVehicleRouter(vehicles: VehicleService) {
  const router = Router();

  router.get("/", handle(async (_req, res) => {
    res.json(await vehicles.list());
  }));

  // Must be declared before "/:id" so "search" isn't read as an id.
  router.get("/search", handle(async (req, res) => {
    const q = req.query;
    res.json(
      await vehicles.search({
        make: optionalText(q.make),
        model: optionalText(q.model),
        category: optionalText(q.category),
        minPrice: optionalNumber(q.minPrice, "minPrice"),
        maxPrice: optionalNumber(q.maxPrice, "maxPrice"),
      })
    );
  }));

  router.post("/", handle(async (req, res) => {
    const created = await vehicles.create(pickVehicleFields(req.body) as NewVehicleInput);
    res.status(201).json(created);
  }));

  router.put("/:id", handle(async (req, res) => {
    const id = parseId(String(req.params.id));
    res.json(await vehicles.update(id, pickVehicleFields(req.body) as Partial<NewVehicle>));
  }));

  router.delete("/:id", requireAdmin, handle(async (req, res) => {
    await vehicles.remove(parseId(String(req.params.id)));
    res.status(204).end();
  }));

  router.post("/:id/purchase", handle(async (req, res) => {
    res.json(await vehicles.purchase(parseId(String(req.params.id))));
  }));

  router.post("/:id/restock", requireAdmin, handle(async (req, res) => {
    const id = parseId(String(req.params.id));
    res.json(await vehicles.restock(id, req.body?.amount));
  }));

  return router;
}