import mongoose from "mongoose";

const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },

    // GeoJSON coordinates: [longitude, latitude]
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator(coordinates) {
          if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return false;
          }

          const [longitude, latitude] = coordinates;

          return (
            Number.isFinite(longitude) &&
            Number.isFinite(latitude) &&
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90
          );
        },
        message: "إحداثيات الموقع غير صحيحة",
      },
    },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "صاحب العنوان مطلوب"],
      immutable: true,
    },

    label: {
      type: String,
      trim: true,
      maxlength: [30, "اسم العنوان غير صالح"],
      default: "عنواني",
    },

    city: {
      type: String,
      required: [true, "المدينة مطلوبة"],
      trim: true,
      minlength: [2, "اسم المدينة غير صالح"],
      maxlength: [80, "اسم المدينة طويل جدًا"],
    },

    district: {
      type: String,
      required: [true, "الحي مطلوب"],
      trim: true,
      minlength: [2, "اسم الحي غير صالح"],
      maxlength: [100, "اسم الحي طويل جدًا"],
    },

    street: {
      type: String,
      required: [true, "اسم الشارع مطلوب"],
      trim: true,
      minlength: [2, "اسم الشارع غير صالح"],
      maxlength: [150, "اسم الشارع طويل جدًا"],
    },

    buildingNumber: {
      type: String,
      trim: true,
      maxlength: [30, "رقم المبنى غير صالح"],
    },

    additionalDetails: {
      type: String,
      trim: true,
      maxlength: [300, "تفاصيل العنوان طويلة جدًا"],
    },

    location: {
      type: locationSchema,
      default: undefined,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "addresses",
  },
);

// Retrieve a user's saved addresses
addressSchema.index({ user: 1, createdAt: -1 });

// Allow only one default address per user
addressSchema.index(
  { user: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  },
);

// Support geospatial queries
addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);

export default Address;
