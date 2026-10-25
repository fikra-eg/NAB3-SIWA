import AppError from "../../utils/appError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("يرجى تسجيل الدخول للمتابعة.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("ليس لديك صلاحية لتنفيذ هذا الإجراء.", 403));
    }

    next();
  };
};
