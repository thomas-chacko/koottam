import { NODE_ENV } from "../config/env.js";
import AppError from "../utils/AppError.js";

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log error details for debugging
  console.error(`[error] ${statusCode} — ${err.message}`);
  
  if (NODE_ENV === "development") {
    console.error(err.stack);
    return res.status(statusCode).json({
      success: false,
      status,
      message: err.message || "Internal Server Error",
      stack: err.stack,
    });
  }

  // Production Error Response (Hides Stack Trace)
  if (err.isOperational) {
    // Trusted operational error (e.g. from our AppError)
    res.status(statusCode).json({
      success: false,
      status,
      message: err.message,
    });
  } else {
    // Unknown programmatic bugs
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export default errorHandler;
