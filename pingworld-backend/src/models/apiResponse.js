import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  UnAuthorizedError,
  ForbiddenError,
} from "../helper/customError.js";

class ApiResponse {
  constructor(success, data, error, statusCode) {
    this.setSuccess(success);
    this.setData(data);
    this.setError(error);
    this.setStatusCode(statusCode);
  }

  setSuccess(success) {
    if (typeof success !== "boolean") {
      throw new Error("Success must be a boolean value");
    }
    this.success = success;
  }

  setData(data) {
    if (data !== null && (typeof data !== "object" && typeof data !== "string")) {
      throw new Error("Data must be either an object, string or null");
    }

    (typeof data === "string") ? data = { "message": data } : null;
    this.data = data;
  }

  setError(error) {
    if (error !== null && typeof error !== "string") {
      throw new Error("Error must be either a string or null");
    }
    this.error = error;
  }

  setStatusCode(statusCode) {
    if (statusCode !== null && typeof statusCode !== "number") {
      throw new Error("Status Code must be either a number or null");
    }
    this.status_code = statusCode;
  }

  static Success(data) {
    return new ApiResponse(true, data, null, 200);
  }

  static Error(message) {
    return new ApiResponse(false, null, message, 400);
  }

  static BadRequestError(message) {
    throw new BadRequestError(message);
  }

  static NotFoundError(message) {
    throw new NotFoundError(message);
  }

  static InternalServerError(message) {
    throw new InternalServerError(message);
  }

  static UnAuthorizedError(message) {
    throw new UnAuthorizedError(message);
  }

  static ForbiddenError(message) {
    throw new ForbiddenError(message);
  }
}

export default ApiResponse;
