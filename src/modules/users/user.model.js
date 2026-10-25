// Defines the User data structure and how users are stored in MongoDB

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      minlength: [3, "يجب ألا يقل الاسم عن 3 أحرف"],
      maxlength: [30, "يجب ألا يزيد الاسم عن 30 حرفًا"],
    },

    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      select: false,
    },

    phone: {
      type: String,
      required: [true, "رقم الجوال مطلوب"],
      unique: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "driver", "admin"],
      default: "customer",
    },

    isActive: { type: Boolean, default: true },

    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true, collection: "user" },
);

const User = mongoose.model("User", userSchema);

export default User;
