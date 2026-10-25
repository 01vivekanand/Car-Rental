import {
  NewVehicle,
  VehicleRecord,
  VehicleRepository,
  VehicleSearchFilters,
} from "../repositories/vehicle.repository";

/** Test double that keeps vehicles in an array. */
export class InMemoryVehicleRepository implements VehicleRepository {
  private items: VehicleRecord[] = [];
  private nextId = 1;

  async create(data: NewVehicle) {
    const vehicle = { id: this.nextId++, ...data };
    this.items.push(vehicle);
    return { ...vehicle };
  }

  async findAll() {
    return this.items.map((v) => ({ ...v }));
  }

  async findById(id: number) {
    const found = this.items.find((v) => v.id === id);
    return found ? { ...found } : null;
  }

  async search(f: VehicleSearchFilters) {
    const has = (value: string, part?: string) =>
      !part || value.toLowerCase().includes(part.toLowerCase());
    return this.items
      .filter(
        (v) =>
          has(v.make, f.make) &&
          has(v.model, f.model) &&
          has(v.category, f.category) &&
          (f.minPrice === undefined || v.price >= f.minPrice) &&
          (f.maxPrice === undefined || v.price <= f.maxPrice)
      )
      .map((v) => ({ ...v }));
  }

  async update(id: number, data: Partial<NewVehicle>) {
    const found = this.items.find((v) => v.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return { ...found };
  }

  async delete(id: number) {
    const index = this.items.findIndex((v) => v.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  async decrementStock(id: number) {
    const found = this.items.find((v) => v.id === id);
    if (!found || found.quantity <= 0) return null;
    found.quantity -= 1;
    return { ...found };
  }

  async incrementStock(id: number, amount: number) {
    const found = this.items.find((v) => v.id === id);
    if (!found) return null;
    found.quantity += amount;
    return { ...found };
  }
}