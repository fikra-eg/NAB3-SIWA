import AppError from "../../utils/appError.js";

import {
  getUsers,
  getUserById,
  updateUserById,
  updateUserStatusById,
  updateUserRoleById,
} from "./user.service.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getUsers({ page, limit });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserById(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المستخدم بنجاح.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const isCurrentUser = req.user._id.equals(req.params.id);

    if (isCurrentUser && req.body.isActive === false) {
      throw new AppError("لا يمكنك تعطيل حسابك بنفسك.", 403);
    }

    const user = await updateUserStatusById(req.params.id, req.body.isActive);

    return res.status(200).json({
      success: true,
      message: "تم تحديث حالة الحساب بنجاح.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const isCurrentUser = req.user._id.equals(req.params.id);

    if (isCurrentUser && req.body.role !== req.user.role) {
      throw new AppError("لا يمكنك تغيير دور حسابك بنفسك.", 403);
    }

    const user = await updateUserRoleById(req.params.id, req.body.role);

    return res.status(200).json({
      success: true,
      message: "تم تحديث دور المستخدم بنجاح.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await updateUserById(req.user._id, req.body);

    return res.status(200).json({
      success: true,
      message: "تم تحديث بياناتك بنجاح.",
      user,
    });
  } catch (error) {
    next(error);
  }
};
