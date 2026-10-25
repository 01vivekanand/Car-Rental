import {
  NewVehicle,
  VehicleRecord,
  VehicleRepository,
  VehicleSearchFilters,
} from "../repositories/vehicle.repository";

export class VehicleNotFoundError extends Error {
  constructor() {
    super("Vehicle not found");
    this.name = "VehicleNotFoundError";
  }
}

export class OutOfStockError extends Error {
  constructor() {
    super("Vehicle is out of stock");
    this.name = "OutOfStockError";
  }
}

export class VehicleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VehicleValidationError";
  }
}

export type NewVehicleInput = Omit<NewVehicle, "quantity"> & { quantity?: number };

const isText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

/** Throws if a field is invalid. With partial=true, missing fields are allowed. */
function validate(data: Partial<NewVehicle>, partial: boolean) {
  for (const key of ["make", "model", "category"] as const) {
    const value = data[key];
    if (value === undefined ? !partial : !isText(value)) {
      throw new VehicleValidationError(`${key} is required`);
    }
  }

  const { price, quantity } = data;
  if (price === undefined ? !partial : !(typeof price === "number" && price >= 0)) {
    throw new VehicleValidationError("price must be a number of 0 or more");
  }
  if (quantity !== undefined && !(Number.isInteger(quantity) && quantity >= 0)) {
    throw new VehicleValidationError("quantity must be a whole number of 0 or more");
  }
}

export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  async create(input: NewVehicleInput): Promise<VehicleRecord> {
    validate(input, false);
    return this.vehicles.create({ ...input, quantity: input.quantity ?? 0 });
  }

  list(): Promise<VehicleRecord[]> {
    return this.vehicles.findAll();
  }

  search(filters: VehicleSearchFilters): Promise<VehicleRecord[]> {
    return this.vehicles.search(filters);
  }

  async update(id: number, data: Partial<NewVehicle>): Promise<VehicleRecord> {
    validate(data, true);
    const updated = await this.vehicles.update(id, data);
    if (!updated) throw new VehicleNotFoundError();
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.vehicles.delete(id);
    if (!deleted) throw new VehicleNotFoundError();
  }

  /** Buys one unit. The repository decrements atomically, so stock never goes below zero. */
  async purchase(id: number): Promise<VehicleRecord> {
    const updated = await this.vehicles.decrementStock(id);
    if (updated) return updated;

    const existing = await this.vehicles.findById(id);
    if (!existing) throw new VehicleNotFoundError();
    throw new OutOfStockError();
  }

  async restock(id: number, amount: number): Promise<VehicleRecord> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new VehicleValidationError("amount must be a positive whole number");
    }
    const updated = await this.vehicles.incrementStock(id, amount);
    if (!updated) throw new VehicleNotFoundError();
    return updated;
  }
}