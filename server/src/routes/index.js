import { Router } from "express";

const router = Router();

// ─── Health Check
router.get("/health", (_req, res) => {
  res.json({ 
    success: true, 
    message: "Koottam API is healthy",
    timestamp: new Date().toISOString()
  });
});

export default router;
