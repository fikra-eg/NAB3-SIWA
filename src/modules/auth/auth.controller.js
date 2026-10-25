//Handles HTTP requests and responses for authentication operations

import {
  loginUser,
  registerUser,
  changePassword as changePasswordService,
} from "./auth.service.js";

export const register = async (req, res) => {
  // req.body has already been validated by the validation middleware.

  const { token, user } = await registerUser(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: ". تم إنشاء الحساب بنجاح",
    user,
  });
};

//

export const login = async (req, res) => {
  const { token, user } = await loginUser(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: ". تم تسجيل الدخول بنجاح",
    user,
  });
};

//

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: ". تم تسجيل الخروج بنجاح",
  });
};

//

export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
    },
  });
};

export const changePassword = async (req, res, next) => {
  try {
    await changePasswordService({
      userId: req.user._id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
