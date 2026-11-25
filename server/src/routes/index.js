import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import mediaRoutes from "./mediaRoutes.js";
import postRoutes from "./postRoutes.js";
import searchRoutes from "./searchRoutes.js";
import likeRoutes from "./likeRoutes.js";
import commentRoutes from "./commentRoutes.js";
import followRoutes from "./followRoutes.js";
import feedRoutes from "./feedRoutes.js";
import bookmarkRoutes from "./bookmarkRoutes.js";
import shareRoutes from "./shareRoutes.js";
import viewRoutes from "./viewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import storyRoutes from "./storyRoutes.js";
import hashtagRoutes from "./hashtagRoutes.js";
import messageRoutes from "./messageRoutes.js";
import reportRoutes from "./reportRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

// ─── Health Check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Koottam API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Search Routes
router.use("/search", searchRoutes);

// ─── Authentication Routes
router.use("/auth", authRoutes);

// ─── User Routes
router.use("/user", userRoutes);

// ─── Media Routes
router.use("/media", mediaRoutes);

// ─── Post Routes
router.use("/post", postRoutes);

// ─── Like Routes
router.use("/like", likeRoutes);

// ─── Comment Routes
router.use("/comment", commentRoutes);

// ─── Follow Routes
router.use("/follow", followRoutes);

// ─── Feed Routes
router.use("/feed", feedRoutes);

// ─── Bookmark Routes
router.use("/bookmark", bookmarkRoutes);

// ─── Share Routes
router.use("/share", shareRoutes);

// ─── View Routes
router.use("/view", viewRoutes);

// ─── Notification Routes
router.use("/notification", notificationRoutes);

// ─── Story Routes
router.use("/story", storyRoutes);

// ─── Hashtag Routes
router.use("/hashtag", hashtagRoutes);

// ─── Message Routes
router.use("/message", messageRoutes);

// ─── Report Routes
router.use("/report", reportRoutes);

// ─── Settings Routes
router.use("/settings", settingsRoutes);

// ─── Admin Routes
router.use("/admin", adminRoutes);

export default router;
