import { Router } from "express";
import { globalSearch } from "../controllers/searchController.js";

const router = Router();

// @route   GET /api/v1/search?q=query
router.get("/", globalSearch);

export default router;
