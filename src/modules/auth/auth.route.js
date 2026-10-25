// auth.route.js: Defines the authentication API endpoints and connects requests to their handlers.

import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "./auth.validation.js";
import { getMe, login, logout, register } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import { authorize } from "./authorization.middleware.js";
import { changePassword } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema, "body"), register);

router.post("/login", validate(loginSchema, "body"), login);

router.post("/logout", logout);

router.get("/me", authenticate, getMe);

router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema, "body"),
  changePassword,
);
export default router;
