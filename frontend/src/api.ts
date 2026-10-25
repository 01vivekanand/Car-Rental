import type { AuthResult, SearchFilters, User, Vehicle, VehicleInput } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const TOKEN_KEY = "dealership_token";
export const USER_KEY = "dealership_user";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // An expired token on a protected route sends the user back to login.
    if (res.status === 401 && !path.startsWith("/api/auth")) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    throw new ApiError(res.status, data.error ?? "Request failed");
  }
  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  register: (email: string, password: string) =>
    request<User>("/api/auth/register", { method: "POST", body: json({ email, password }) }),

  login: (email: string, password: string) =>
    request<AuthResult>("/api/auth/login", { method: "POST", body: json({ email, password }) }),

  /** Uses the list endpoint when no filter is set, otherwise the search endpoint. */
  searchVehicles: (filters: SearchFilters) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) params.set(key, value.trim());
    }
    const query = params.toString();
    return request<Vehicle[]>(query ? `/api/vehicles/search?${query}` : "/api/vehicles");
  },

  createVehicle: (input: VehicleInput) =>
    request<Vehicle>("/api/vehicles", { method: "POST", body: json(input) }),

  updateVehicle: (id: number, input: VehicleInput) =>
    request<Vehicle>(`/api/vehicles/${id}`, { method: "PUT", body: json(input) }),

  deleteVehicle: (id: number) => request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),

  purchase: (id: number) =>
    request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: "POST" }),

  restock: (id: number, amount: number) =>
    request<Vehicle>(`/api/vehicles/${id}/restock`, { method: "POST", body: json({ amount }) }),
};