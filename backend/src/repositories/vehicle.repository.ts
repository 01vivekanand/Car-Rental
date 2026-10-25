export interface VehicleRecord {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export type NewVehicle = Omit<VehicleRecord, "id">;

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Storage contract for vehicles. The service depends on this, not on Prisma. */
export interface VehicleRepository {
  create(data: NewVehicle): Promise<VehicleRecord>;
  findAll(): Promise<VehicleRecord[]>;
  findById(id: number): Promise<VehicleRecord | null>;
  search(filters: VehicleSearchFilters): Promise<VehicleRecord[]>;
  update(id: number, data: Partial<NewVehicle>): Promise<VehicleRecord | null>;
  delete(id: number): Promise<boolean>;
  /** Atomically takes one unit from stock. Returns null if none is left or the id is unknown. */
  decrementStock(id: number): Promise<VehicleRecord | null>;
  incrementStock(id: number, amount: number): Promise<VehicleRecord | null>;
}