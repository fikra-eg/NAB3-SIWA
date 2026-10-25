import { z } from "zod";

const locationSchema = z
  .object({
    type: z.literal("Point"),

    // GeoJSON order: [longitude, latitude]
    coordinates: z.tuple([
      z.number().min(-180, "خط الطول غير صحيح").max(180, "خط الطول غير صحيح"),

      z.number().min(-90, "خط العرض غير صحيح").max(90, "خط العرض غير صحيح"),
    ]),
  })
  .strict("بيانات الموقع غير صحيحة");

const addressFields = {
  label: z
    .string()
    .trim()
    .min(2, "اسم العنوان قصير جدًا")
    .max(30, "اسم العنوان طويل جدًا")
    .optional(),

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

  // Optional to support manual addresses without map coordinates
  location: locationSchema.optional(),
};

export const createAddressSchema = z
  .object(addressFields)
  .strict("توجد حقول غير مسموح بها في العنوان");

export const updateAddressSchema = z
  .object({
    label: addressFields.label,
    city: addressFields.city.optional(),
    district: addressFields.district.optional(),
    street: addressFields.street.optional(),
    buildingNumber: addressFields.buildingNumber,
    additionalDetails: addressFields.additionalDetails,
    location: locationSchema.optional(),
  })
  .strict("توجد حقول غير مسموح بها في العنوان")
  .refine((data) => Object.keys(data).length > 0, {
    message: "يرجى إدخال حقل واحد على الأقل للتعديل",
  });
