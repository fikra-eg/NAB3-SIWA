// error-handler.middleware.js: Handles application errors in one centralized place and returns consistent API responses.

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى"
        : error.message,
  });
};
