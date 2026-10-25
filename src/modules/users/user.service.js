import AppError from "../../utils/appError.js";
import User from "./user.model.js";

export const getUsers = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  return user;
};

export const updateUserById = async (userId, data) => {
  const updates = {};

  if (data.name !== undefined) {
    updates.name = data.name;
  }

  if (data.phone !== undefined) {
    updates.phone = data.phone;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    },
  )
    .select("-password")
    .lean();

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  return user;
};

export const updateUserStatusById = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    {
      returnDocument: "after",
      runValidators: true,
    },
  )
    .select("-password")
    .lean();

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  return user;
};

export const updateUserRoleById = async (userId, role) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    {
      returnDocument: "after",
      runValidators: true,
    },
  )
    .select("-password")
    .lean();

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  return user;
};
