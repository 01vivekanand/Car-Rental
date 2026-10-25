import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import {
  AuthService,
  EmailAlreadyUsedError,
  InvalidCredentialsError,
} from "./services/auth.service";
import {
  OutOfStockError,
  VehicleNotFoundError,
  VehicleService,
  VehicleValidationError,
} from "./services/vehicle.service";
import { createAuthRouter } from "./routes/auth.routes";
import { createVehicleRouter } from "./routes/vehicle.routes";
import { authenticate } from "./middleware/auth";

export interface AppDependencies {
  auth: AuthService;
  vehicles: VehicleService;
  jwtSecret: string;
}

export function createApp({ auth, vehicles, jwtSecret }: AppDependencies) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", createAuthRouter(auth));
  app.use("/api/vehicles", authenticate(jwtSecret), createVehicleRouter(vehicles));

  // Central error handler: maps domain errors to HTTP status codes.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof EmailAlreadyUsedError || err instanceof OutOfStockError) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: err.message });
    }
    if (err instanceof VehicleNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (
      err instanceof VehicleValidationError ||
      (err as { type?: string }).type === "entity.parse.failed"
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}