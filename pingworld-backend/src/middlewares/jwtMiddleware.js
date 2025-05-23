import ApiResponse from "../models/apiResponse.js";
import jsonwebtoken from "jsonwebtoken";
import { fetchAndValidateUserForToken } from "../services/authService.js";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(ApiResponse.BadRequestError("Bearer authorization header is invalid or missing."));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
    const user = await fetchAndValidateUserForToken(decoded.id, decoded.iat);

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiResponse) {
      return next(error);
    }
    if (error.name === "TokenExpiredError") {
      return next(ApiResponse.UnAuthorizedError("Token expired. Please log in again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(ApiResponse.UnAuthorizedError("Invalid token. Please log in again."));
    }
    return next(ApiResponse.UnAuthorizedError("Unauthorized access."));
  }
};
