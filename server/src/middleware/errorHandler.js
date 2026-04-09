import { NODE_ENV } from "../config/env.js";

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Log error details for debugging
  console.error(`[error] ${statusCode} — ${err.message}`);
  if (NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
