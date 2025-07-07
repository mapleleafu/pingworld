import * as customErrors from "../helper/customError.js";

function errorMiddleware(error, req, res, next) {
  const status = error.status || 500;

  // Check if the error is an instance of any custom error
  if (Object.values(customErrors).some((customError) => error instanceof customError)) {
    res.status(error.status).json({
      success: error.success,
      data: error.data,
      error: error.error,
      status: status,
    });
  } else {
    // Fallback for other types of errors
    res.status(status).json({
      success: false,
      data: null,
      error: {
        message: error.message,
      },
      status: status,
    });
  }
}

export default errorMiddleware;
