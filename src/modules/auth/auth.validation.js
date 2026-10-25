import { z } from "zod";
import { normalizeSaudiPhone } from "../../utils/normalize-saudi-phone.js";

// Validates and normalizes Saudi mobile numbers
const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeSaudiPhone)
  .pipe(
    z.string().regex(/^05[013456789]\d{7}$/, "رقم الجوال السعودي غير صحيح"),
  );

// Registration
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "يجب ألا يقل الاسم عن 3 أحرف")
      .max(30, "الاسم غير صالح"),

    phone: phoneSchema,

    password: z
      .string()
      .min(8, "يجب ألا تقل كلمة المرور عن 8 أحرف")
      .max(18, "كلمة المرور غير صالحة"),
  })
  .strict("توجد حقول غير مسموح بها");

// Login
export const loginSchema = z
  .object({
    phone: phoneSchema,

    password: z
      .string()
      .min(1, "يرجى إدخال كلمة المرور")
      .max(18, "كلمة المرور غير صالحة"),
  })
  .strict("توجد حقول غير مسموح بها");

// Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "يرجى إدخال كلمة المرور الحالية")
      .max(18, "كلمة المرور الحالية غير صالحة"),

    newPassword: z
      .string()
      .min(8, "يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف")
      .max(18, "كلمة المرور الجديدة غير صالحة"),
  })
  .strict("توجد حقول غير مسموح بها")
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "يجب أن تختلف كلمة المرور الجديدة عن الحالية",
  });
