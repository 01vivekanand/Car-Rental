import { Router } from "express";
import { AuthService } from "../services/auth.service";

/** Auth endpoints. Public registration always creates a normal USER. */
export function createAuthRouter(auth: AuthService) {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      if (
        typeof email !== "string" ||
        !email.includes("@") ||
        typeof password !== "string" ||
        password.length < 6
      ) {
        return res
          .status(400)
          .json({ error: "A valid email and a password of 6+ characters are required" });
      }

      const user = await auth.register(email, password);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Email and password are required" });
      }
      res.json(await auth.login(email, password));
    } catch (err) {
      next(err);
    }
  });

  return router;
}