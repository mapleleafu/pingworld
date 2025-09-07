import express from "express";
import checkJWT from "../middlewares/jwtMiddleware.js";
import * as authController from "../controllers/authController.js";
import { loginSchema, registerSchema, changePasswordSchema } from "../validations/authSchemas.js";
import validateRequest from "../middlewares/validateRequest.js";
const router = express.Router();

router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/refresh/token", authController.handleRefreshToken);
router.get("/profile", checkJWT, authController.profile);
router.post("/logout", checkJWT, authController.logout);
router.post("/password/change", checkJWT, validateRequest(changePasswordSchema), authController.changePassword);

export default router;
