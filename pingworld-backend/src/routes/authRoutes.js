import express from "express";
import checkJWT from "../middlewares/jwtMiddleware.js";
import * as authController from "../controllers/authController.js";
import { loginSchema, registerSchema } from "../validations/authSchemas.js";
import validateRequest from "../middlewares/validateRequest.js";
const router = express.Router();

router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/refresh/token", authController.handleRefreshToken);
router.post("/profile", checkJWT, authController.profile);

export default router;
