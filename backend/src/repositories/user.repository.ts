export type Role = "USER" | "ADMIN";

export interface UserRecord {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  role?: Role;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: NewUser): Promise<UserRecord>;
}