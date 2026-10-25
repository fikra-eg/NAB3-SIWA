import { z } from "zod";

// Validates input for user management operations.

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => {
    if (value.startsWith("+966")) {
      return `0${value.slice(4)}`;
    }

    return value;
  })
  .pipe(
    z
      .string()
      .regex(
        /^05[013456789][0-9]{7}$/,
        "رقم الجوال غير صحيح. أدخل رقم جوال سعودي صحيحًا.",
      ),
  );

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "يجب ألا يقل الاسم عن 3 أحرف.")
      .max(24, "يجب ألا يزيد الاسم عن 24 حرفًا.")
      .optional(),

    phone: phoneSchema.optional(),
  })
  .strict("لا يمكن تعديل حقول غير مسموح بها.")
  .refine((data) => Object.keys(data).length > 0, {
    message: "يرجى إدخال حقل واحد على الأقل للتعديل.",
  });

export const updateUserStatusSchema = z
  .object({
    isActive: z.boolean({
      error: "يجب تحديد ما إذا كان الحساب نشطًا أو غير نشط.",
    }),
  })
  .strict("لا يمكن تعديل حقول غير مسموح بها.");

export const updateUserRoleSchema = z
  .object({
    role: z.enum(["customer", "driver", "admin"], {
      error: "الدور المحدد غير صحيح. اختر دورًا من الأدوار المتاحة.",
    }),
  })
  .strict("لا يمكن تعديل حقول غير مسموح بها.");
