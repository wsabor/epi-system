import { Router } from "express";
import { prisma } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", banco: "ok" });
  } catch (err) {
    console.error("Health check: banco indisponível", err.message);
    res.status(503).json({ status: "erro", banco: "indisponível" });
  }
});
