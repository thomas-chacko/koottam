import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

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

// ─── User Routes
router.use("/users", userRoutes);

export default router;
