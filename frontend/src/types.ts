export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export type VehicleInput = Omit<Vehicle, "id">;

export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}