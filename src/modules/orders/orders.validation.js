import { z } from "zod";
import { normalizeSaudiPhone } from "../../utils/normalize-saudi-phone.js";

const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeSaudiPhone)
  .pipe(
    z.string().regex(/^05[013456789]\d{7}$/, "رقم الجوال السعودي غير صحيح"),
  );

const customerInfoSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "يجب ألا يقل اسم العميل عن 3 أحرف")
      .max(60, "اسم العميل غير صالح"),

    phone: phoneSchema,
  })
  .strict("توجد حقول غير مسموح بها في بيانات العميل");

const deliveryAddressSchema = z
  .object({
    city: z
      .string()
      .trim()
      .min(2, "يرجى إدخال اسم المدينة")
      .max(80, "اسم المدينة غير صالح"),

    district: z
      .string()
      .trim()
      .min(2, "يرجى إدخال اسم الحي")
      .max(100, "اسم الحي غير صالح"),

    street: z
      .string()
      .trim()
      .min(2, "يرجى إدخال اسم الشارع")
      .max(150, "اسم الشارع غير صالح"),

    buildingNumber: z.string().trim().max(30, "رقم المبنى غير صالح").optional(),

    additionalDetails: z
      .string()
      .trim()
      .max(300, "تفاصيل العنوان طويلة جدًا")
      .optional(),
  })
  .strict("توجد حقول غير مسموح بها في عنوان التوصيل");

export const createOrderSchema = z
  .object({
    customerInfo: customerInfoSchema,

    deliveryAddress: deliveryAddressSchema,

    quantity: z
      .number()
      .int("يجب أن تكون كمية العبوات عددًا صحيحًا")
      .min(1, "يجب طلب عبوة واحدة على الأقل"),
  })
  .strict("توجد حقول غير مسموح بها في الطلب");
