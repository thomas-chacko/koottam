import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./env.js";
import db from "./db.js";

let io;
const userSockets = new Map(); // Map userId to socketId

/**
 * Initialize Socket.IO with the HTTP server
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const userResult = await db.query(
        "SELECT id, username, email, full_name, avatar_url, role FROM users WHERE id = $1",
        [decoded.id]
      );

      if (!userResult.rows[0]) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = userResult.rows[0];
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`[socket] User connected: ${socket.user.username} (${userId})`);

    // Store user socket mapping
    userSockets.set(userId, socket.id);

    // Update user's last_seen and broadcast online status
    updateUserLastSeen(userId);
    socket.broadcast.emit("user:online", { userId });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle typing events
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        userId,
        username: socket.user.username,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId,
        conversationId,
      });
    });

    // Join conversation room
    socket.on("conversation:join", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[socket] User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on("conversation:leave", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[socket] User ${userId} left conversation ${conversationId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[socket] User disconnected: ${socket.user.username}`);
      userSockets.delete(userId);
      updateUserLastSeen(userId);
      socket.broadcast.emit("user:offline", { userId });
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

/**
 * Check if a user is online
 */
export const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

/**
 * Get user's socket ID
 */
export const getUserSocketId = (userId) => {
  return userSockets.get(userId);
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

/**
 * Emit event to conversation room
 */
export const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

/**
 * Update user's last_seen timestamp
 */
const updateUserLastSeen = async (userId) => {
  try {
    await db.query(
      "UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1",
      [userId]
    );
  } catch (error) {
    console.error(`[socket] Error updating last_seen for user ${userId}:`, error);
  }
};

export default { initSocket, getIO, isUserOnline, emitToUser, emitToConversation };

