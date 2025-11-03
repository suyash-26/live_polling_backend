// Global Error Handler
module.exports = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    msg: err.message || "An unexpected error occurred. Please try again later.",
    errorCode: err.errorCode || "SERVER_ERROR",
  };

  if (err.name === "ValidationError") {
    errorResponse.msg = "Invalid input data";
    errorResponse.errorCode = "VALIDATION_ERROR";
    errorResponse.details = Object.values(err.errors).map((e) => e.message);
    res.status(400);
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    errorResponse.msg = "A user with this email already exists";
    errorResponse.errorCode = "DUPLICATE_EMAIL";
    res.status(400);
  } else if (err.name === "JsonWebTokenError") {
    errorResponse.msg = "Invalid or expired token";
    errorResponse.errorCode = "INVALID_TOKEN";
    res.status(401);
  }

  res.status(statusCode).json(errorResponse);
};
