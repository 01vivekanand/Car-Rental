import {
  OutOfStockError,
  VehicleNotFoundError,
  VehicleService,
  VehicleValidationError,
} from "./vehicle.service";
import {
  VehicleRecord,
  VehicleRepository,
} from "../repositories/vehicle.repository";

const makeRepo = (): jest.Mocked<VehicleRepository> => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
});

const camry: VehicleRecord = {
  id: 1,
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 28500,
  quantity: 5,
};

describe("VehicleService.create", () => {
  it("saves a valid vehicle and defaults quantity to 0", async () => {
    const repo = makeRepo();
    repo.create.mockImplementation(async (data) => ({ id: 1, ...data }));
    const service = new VehicleService(repo);

    const result = await service.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 28500,
    });

    expect(repo.create).toHaveBeenCalledWith({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 28500,
      quantity: 0,
    });
    expect(result.id).toBe(1);
  });

  it("rejects a negative price", async () => {
    const service = new VehicleService(makeRepo());

    await expect(
      service.create({ make: "A", model: "B", category: "C", price: -1 })
    ).rejects.toThrow(VehicleValidationError);
  });

  it("rejects a missing make", async () => {
    const service = new VehicleService(makeRepo());

    await expect(
      service.create({ make: "", model: "B", category: "C", price: 10 })
    ).rejects.toThrow(VehicleValidationError);
  });

  it("rejects a fractional quantity", async () => {
    const service = new VehicleService(makeRepo());

    await expect(
      service.create({ make: "A", model: "B", category: "C", price: 10, quantity: 1.5 })
    ).rejects.toThrow(VehicleValidationError);
  });
});

describe("VehicleService.list and search", () => {
  it("lists all vehicles", async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([camry]);

    expect(await new VehicleService(repo).list()).toEqual([camry]);
  });

  it("passes search filters to the repository", async () => {
    const repo = makeRepo();
    repo.search.mockResolvedValue([camry]);
    const filters = { make: "Toyota", minPrice: 20000, maxPrice: 30000 };

    const result = await new VehicleService(repo).search(filters);

    expect(repo.search).toHaveBeenCalledWith(filters);
    expect(result).toEqual([camry]);
  });
});

describe("VehicleService.update", () => {
  it("returns the updated vehicle", async () => {
    const repo = makeRepo();
    repo.update.mockResolvedValue({ ...camry, price: 27000 });

    const result = await new VehicleService(repo).update(1, { price: 27000 });

    expect(repo.update).toHaveBeenCalledWith(1, { price: 27000 });
    expect(result.price).toBe(27000);
  });

  it("throws when the vehicle does not exist", async () => {
    const repo = makeRepo();
    repo.update.mockResolvedValue(null);

    await expect(new VehicleService(repo).update(99, { price: 1 })).rejects.toThrow(
      VehicleNotFoundError
    );
  });

  it("rejects a negative price", async () => {
    await expect(
      new VehicleService(makeRepo()).update(1, { price: -5 })
    ).rejects.toThrow(VehicleValidationError);
  });
});

describe("VehicleService.remove", () => {
  it("deletes an existing vehicle", async () => {
    const repo = makeRepo();
    repo.delete.mockResolvedValue(true);

    await new VehicleService(repo).remove(1);

    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it("throws when the vehicle does not exist", async () => {
    const repo = makeRepo();
    repo.delete.mockResolvedValue(false);

    await expect(new VehicleService(repo).remove(99)).rejects.toThrow(
      VehicleNotFoundError
    );
  });
});

describe("VehicleService.purchase", () => {
  it("decreases stock and returns the vehicle", async () => {
    const repo = makeRepo();
    repo.decrementStock.mockResolvedValue({ ...camry, quantity: 4 });

    const result = await new VehicleService(repo).purchase(1);

    expect(result.quantity).toBe(4);
  });

  it("throws OutOfStockError when no stock is left", async () => {
    const repo = makeRepo();
    repo.decrementStock.mockResolvedValue(null);
    repo.findById.mockResolvedValue({ ...camry, quantity: 0 });

    await expect(new VehicleService(repo).purchase(1)).rejects.toThrow(
      OutOfStockError
    );
  });

  it("throws VehicleNotFoundError for an unknown vehicle", async () => {
    const repo = makeRepo();
    repo.decrementStock.mockResolvedValue(null);
    repo.findById.mockResolvedValue(null);

    await expect(new VehicleService(repo).purchase(99)).rejects.toThrow(
      VehicleNotFoundError
    );
  });
});

describe("VehicleService.restock", () => {
  it("increases stock by the given amount", async () => {
    const repo = makeRepo();
    repo.incrementStock.mockResolvedValue({ ...camry, quantity: 15 });

    const result = await new VehicleService(repo).restock(1, 10);

    expect(repo.incrementStock).toHaveBeenCalledWith(1, 10);
    expect(result.quantity).toBe(15);
  });

  it("rejects an amount that is not a positive whole number", async () => {
    const service = new VehicleService(makeRepo());

    await expect(service.restock(1, 0)).rejects.toThrow(VehicleValidationError);
    await expect(service.restock(1, -3)).rejects.toThrow(VehicleValidationError);
    await expect(service.restock(1, 2.5)).rejects.toThrow(VehicleValidationError);
  });

  it("throws VehicleNotFoundError for an unknown vehicle", async () => {
    const repo = makeRepo();
    repo.incrementStock.mockResolvedValue(null);

    await expect(new VehicleService(repo).restock(99, 5)).rejects.toThrow(
      VehicleNotFoundError
    );
  });
});