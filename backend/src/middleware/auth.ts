import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/** Verifies the Bearer token and stores the caller in res.locals.user. */
export function authenticate(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing token" });
      return;
    }

    try {
      const payload = jwt.verify(header.slice(7), secret) as JwtPayload;
      res.locals.user = { id: Number(payload.sub), role: payload.role };
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

/** Must run after authenticate. Only lets ADMIN users through. */
export function requireAdmin(_req: Request, res: Response, next: NextFunction): void {
  if (res.locals.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}