import { Router } from "express";

const router = Router();

// ─── Health Check
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "PromptStudio API is healthy" });
});

export default router;
