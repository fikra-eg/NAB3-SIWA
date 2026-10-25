import User from "../users/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/generate-token.js";
import { AppError } from "../../utils/appError.js";

// Registers a new customer account.
export const registerUser = async ({ name, phone, password }) => {
  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw new AppError(
      "رقم الجوال مسجّل مسبقًا. يرجى تسجيل الدخول أو استخدام رقم آخر",
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    phone,
    password: hashedPassword,
    role: "customer",
  });

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
};

// Authenticates a user with their phone number and password.
export const loginUser = async ({ phone, password }) => {
  const user = await User.findOne({ phone }).select("+password +tokenVersion");

  if (!user) {
    throw new AppError("رقم الجوال أو كلمة المرور غير صحيحة", 401);
  }

  if (!user.isActive) {
    throw new AppError(
      "لا يمكن تسجيل الدخول إلى هذا الحساب حاليًا. يرجى التواصل مع خدمة العملاء",
      403,
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError("رقم الجوال أو كلمة المرور غير صحيحة", 401);
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
};

// Changes the password after verifying the current password.
export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).select("+password +tokenVersion");

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordCorrect) {
    throw new AppError("كلمة المرور الحالية غير صحيحة", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);

  user.tokenVersion = (user.tokenVersion ?? 0) + 1;

  await user.save();
};
