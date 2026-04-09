import { NODE_ENV } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[error] ${statusCode} — ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
