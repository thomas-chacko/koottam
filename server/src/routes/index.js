import { Router } from "express";
import authRoutes from "./authRoutes.js";

const router = Router();

// ─── Health Check
router.get("/health", (_req, res) => {
  res.json({ 
    success: true, 
    message: "Koottam API is healthy",
    timestamp: new Date().toISOString()
  });
});

// ─── Authentication Routes
router.use("/auth", authRoutes);

export default router;
