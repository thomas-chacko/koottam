import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import mediaRoutes from "./mediaRoutes.js";

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
router.use("/user", userRoutes);

// ─── Media Routes
router.use("/media", mediaRoutes);

export default router;
