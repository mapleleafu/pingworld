import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import ApiResponse from "../models/apiResponse.js";
import jsonwebtoken from "jsonwebtoken";
import ms from "ms";

const isProduction = process.env.NODE_ENV === "production";

async function generateAccessToken(payload) {
  return jsonwebtoken.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

async function generateRefreshToken(payload) {
  return jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "180d",
  });
}

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    maxAge: ms(process.env.JWT_REFRESH_EXPIRES_IN || "180d"),
  });
}

async function refreshUserTokens(tokenFromCookie) {
  if (!tokenFromCookie) {
    throw ApiResponse.UnAuthorizedError("Refresh token not provided.");
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jsonwebtoken.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiResponse.UnAuthorizedError("Refresh token expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
      throw ApiResponse.UnAuthorizedError("Invalid refresh token. Please log in again.");
    }
    throw ApiResponse.UnAuthorizedError("Failed to verify refresh token.");
  }

  const user = await fetchAndValidateUserForToken(decodedRefreshToken.id, decodedRefreshToken.iat);
  const newAccessTokenPayload = {
    id: user.id,
    email: user.email,
  };
  const newAccessToken = await generateAccessToken(newAccessTokenPayload);
  return { accessToken: newAccessToken };
}

async function fetchAndValidateUserForToken(userId, tokenIssuedAtSeconds) {
  const user = await prisma.user.findUnique({
    where: { id: String(userId) },
    select: {
      id: true,
      email: true,
      name: true,
      tokens_valid_from: true,
    },
  });

  if (!user) {
    throw ApiResponse.UnAuthorizedError("User not found.");
  }

  if (user.tokens_valid_from) {
    const tokenIssuedAtMillis = tokenIssuedAtSeconds * 1000;
    const userTokensValidFromMillis = new Date(user.tokens_valid_from).getTime();

    if (tokenIssuedAtMillis < userTokensValidFromMillis) {
      throw ApiResponse.UnAuthorizedError("Token is no longer valid (session revoked).");
    }
  }
  return user;
}

async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiResponse.UnAuthorizedError("Invalid email or password.");

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw ApiResponse.UnAuthorizedError("Invalid email or password.");

  const accessTokenPayload = { id: user.id, email: user.email, name: user.name };
  const refreshTokenPayload = { id: user.id };

  const accessToken = await generateAccessToken(accessTokenPayload);
  const refreshToken = await generateRefreshToken(refreshTokenPayload);

  const userResponseData = { id: user.id, email: user.email, name: user.name };
  return { userResponseData, accessToken, refreshToken };
}

async function registerUser(email, name, password, tempUserId = null) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const userData = {
      email,
      name,
      password: hashedPassword,
    };
    if (tempUserId) {
      userData.temp_user_id = tempUserId;
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  } catch (dbError) {
    if (dbError.code === "P2002" && dbError.meta?.target?.includes("email")) {
      throw ApiResponse.BadRequestError("This email address is already registered.");
    }
    if (dbError.code === "P2002" && dbError.meta?.target?.includes("temp_user_id")) {
        throw ApiResponse.BadRequestError("This temporary ID has already been associated with an account.");
    }
    throw dbError;
  }
}

async function getUserById(userId) {
  if (!userId) throw ApiResponse.BadRequestError("User ID not provided.");

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export {
  loginUser,
  registerUser,
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  refreshUserTokens,
  fetchAndValidateUserForToken,
  getUserById,
};
