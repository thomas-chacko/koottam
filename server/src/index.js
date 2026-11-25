import "dotenv/config";
import { createServer } from "http";

import app from "./app.js";
import { PORT, NODE_ENV } from "./config/env.js";
import { initSocket } from "./config/socket.js";

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`[server] running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`[socket] Socket.IO initialized`);
});

// ─── Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n[server] ${signal} received, closing server gracefully...`);

  server.close(() => {
    console.log("[server] HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("[server] Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
