import ApiResponse from "../models/apiResponse.js";
import { registerUser, loginUser, setRefreshTokenCookie, refreshUserTokens, getUserById, clearRefreshTokenCookie, changeUserPassword } from "../services/authService.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const authData = await loginUser(email, password);

    setRefreshTokenCookie(res, authData.refreshToken);

    res.json(
      ApiResponse.Success({
        message: "Successfully logged in.",
        user: authData.userResponseData,
        accessToken: authData.accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  const { email, user_name, password, tempUserId } = req.body;

  try {
    const newUser = await registerUser(email, user_name, password, tempUserId);
    res.json(ApiResponse.Success({ message: "Successfully registered.", user: newUser }));
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  const tokenFromCookie = req.cookies.refreshToken;

  try {
    const newTokens = await refreshUserTokens(tokenFromCookie);
    res.json(
      ApiResponse.Success({
        message: "Access token refreshed successfully.",
        accessToken: newTokens.accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  const user = await getUserById(req.user.id);
  res.json(ApiResponse.Success({ message: "Successfully retrieved the user.", user }));
};

const logout = async (req, res) => {
  clearRefreshTokenCookie(res);
  console.log(`User ${req.user.id} logged out.`);
  res.json(ApiResponse.Success({ message: "Successfully logged out." }));
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  try {
    await changeUserPassword(req.user.id, oldPassword, newPassword, newPasswordConfirm);
    res.json(ApiResponse.Success({ message: "Password changed successfully." }));
  } catch (error) {
    next(error);
  }
};

export { login, register, profile, handleRefreshToken, logout, changePassword };
