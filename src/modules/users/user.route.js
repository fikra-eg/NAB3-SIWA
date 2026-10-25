import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import {
  getAllUsers,
  getUser,
  updateMyProfile,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "./user.controller.js";
import {
  updateUserRoleSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAllUsers);
router.get("/:id", authenticate, authorize("admin"), getUser);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validate(updateUserStatusSchema, "body"),
  updateUserStatus,
);
router.patch(
  "/me",
  authenticate,
  validate(updateUserSchema, "body"),
  updateMyProfile,
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  validate(updateUserRoleSchema, "body"),
  updateUserRole,
);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateUserSchema, "body"),
  updateUser,
);
export default router;
