import { prisma } from "../config/prisma";
import {
  NewVehicle,
  VehicleRecord,
  VehicleRepository,
  VehicleSearchFilters,
} from "./vehicle.repository";

// Prisma returns price as a Decimal object, so convert it to a number.
const toRecord = (v: {
  id: number;
  make: string;
  model: string;
  category: string;
  price: unknown;
  quantity: number;
  imageUrl: string | null;
}): VehicleRecord => ({
  id: v.id,
  make: v.make,
  model: v.model,
  category: v.category,
  price: Number(v.price),
  quantity: v.quantity,
  imageUrl: v.imageUrl,
});

/** MySQL-backed vehicle storage via Prisma. */
export class PrismaVehicleRepository implements VehicleRepository {
  async create(data: NewVehicle) {
    return toRecord(await prisma.vehicle.create({ data }));
  }

  async findAll() {
    const rows = await prisma.vehicle.findMany({ orderBy: { id: "asc" } });
    return rows.map(toRecord);
  }

  async findById(id: number) {
    const row = await prisma.vehicle.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async search(f: VehicleSearchFilters) {
    const hasPrice = f.minPrice !== undefined || f.maxPrice !== undefined;
    const rows = await prisma.vehicle.findMany({
      where: {
        make: f.make ? { contains: f.make } : undefined,
        model: f.model ? { contains: f.model } : undefined,
        category: f.category ? { contains: f.category } : undefined,
        price: hasPrice ? { gte: f.minPrice, lte: f.maxPrice } : undefined,
      },
      orderBy: { id: "asc" },
    });
    return rows.map(toRecord);
  }

  async update(id: number, data: Partial<NewVehicle>) {
    await prisma.vehicle.updateMany({ where: { id }, data });
    return this.findById(id);
  }

  async delete(id: number) {
    const result = await prisma.vehicle.deleteMany({ where: { id } });
    return result.count > 0;
  }

  /** One conditional UPDATE, so two simultaneous buyers can't push stock below zero. */
  async decrementStock(id: number) {
    const result = await prisma.vehicle.updateMany({
      where: { id, quantity: { gt: 0 } },
      data: { quantity: { decrement: 1 } },
    });
    return result.count === 0 ? null : this.findById(id);
  }

  async incrementStock(id: number, amount: number) {
    await prisma.vehicle.updateMany({
      where: { id },
      data: { quantity: { increment: amount } },
    });
    return this.findById(id);
  }
}