import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import {
  AuthService,
  EmailAlreadyUsedError,
  InvalidCredentialsError,
} from "./services/auth.service";
import { createAuthRouter } from "./routes/auth.routes";

export function createApp(auth: AuthService) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", createAuthRouter(auth));

  // Central error handler: maps domain errors to HTTP status codes.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof EmailAlreadyUsedError) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}