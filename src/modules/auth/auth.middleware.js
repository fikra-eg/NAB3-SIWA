import jwt from "jsonwebtoken";
import AppError from "../../utils/appError.js";
import User from "../users/user.model.js";

// Verifies the user's JWT and attaches the authenticated user to the request.

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("يرجى تسجيل الدخول للمتابعة", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub)
      .select("+tokenVersion")
      .lean();

    if (!user) {
      throw new AppError("المستخدم غير موجود", 401);
    }

    if (!user.isActive) {
      throw new AppError("هذا الحساب غير نشط. يرجى التواصل مع الدعم", 403);
    }

    const currentTokenVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion ?? 0;

    if (tokenVersion !== currentTokenVersion) {
      throw new AppError("يرجى تسجيل الدخول مرة أخرى للمتابعة", 401);
    }

    // Keep the internal tokenVersion out of req.user.
    const { tokenVersion: ignoredVersion, ...authenticatedUser } = user;

    req.user = authenticatedUser;

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AppError("يرجى تسجيل الدخول مرة أخرى للمتابعة", 401));
    }

    return next(error);
  }
};
