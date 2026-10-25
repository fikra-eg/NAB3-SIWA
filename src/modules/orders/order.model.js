import mongoose from "mongoose";
import { OrderStatuses, OrderTypes } from "./order.constants.js";
import { normalizeSaudiPhone } from "../../utils/normalize-saudi-phone.js";

const { Schema } = mongoose;

const isValidAmount = (value) =>
  Number.isFinite(value) && Number.isInteger(value * 2);

const customerInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "اسم العميل مطلوب"],
      trim: true,
      minlength: [3, "يجب ألا يقل الاسم عن 3 أحرف"],
      maxlength: [60, "الاسم غير صالح"],
    },

    phone: {
      type: String,
      required: [true, "رقم جوال العميل مطلوب"],
      trim: true,
      set: normalizeSaudiPhone,
      match: [/^05[013456789]\d{7}$/, "رقم الجوال السعودي غير صحيح"],
    },
  },
  { _id: false },
);

const deliveryAddressSchema = new Schema(
  {
    city: {
      type: String,
      required: [true, "المدينة مطلوبة"],
      trim: true,
      maxlength: [80, "اسم المدينة طويل جدًا"],
    },

    district: {
      type: String,
      required: [true, "الحي مطلوب"],
      trim: true,
      maxlength: [100, "اسم الحي طويل جدًا"],
    },

    street: {
      type: String,
      required: [true, "اسم الشارع مطلوب"],
      trim: true,
      maxlength: [150, "اسم الشارع طويل جدًا"],
    },

    buildingNumber: {
      type: String,
      trim: true,
      maxlength: [30, "رقم المبنى طويل جدًا"],
    },

    additionalDetails: {
      type: String,
      trim: true,
      maxlength: [300, "تفاصيل العنوان طويلة جدًا"],
    },
  },
  { _id: false },
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: OrderStatuses,
      required: [true, "حالة الطلب مطلوبة"],
    },

    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
      maxlength: [300, "الملاحظة طويلة جدًا"],
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "رقم الطلب مطلوب"],
      unique: true,
      immutable: true,
      trim: true,
      maxlength: [40, "رقم الطلب طويل جدًا"],
    },

    // Null for guest orders
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Snapshot of the customer's details at order creation
    customerInfo: {
      type: customerInfoSchema,
      required: [true, "بيانات العميل مطلوبة"],
    },

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, "عنوان التوصيل مطلوب"],
    },

    orderType: {
      type: String,
      enum: OrderTypes,
      default: "one_time",
      required: true,
    },

    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    assignedDriver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    quantity: {
      type: Number,
      required: [true, "كمية العبوات مطلوبة"],
      min: [1, "يجب طلب عبوة واحدة على الأقل"],
      validate: {
        validator: Number.isSafeInteger,
        message: "كمية العبوات غير صحيحة",
      },
    },

    // Monetary values are stored in SAR, in increments of 0.5
    unitPrice: {
      type: Number,
      required: [true, "سعر العبوة مطلوب"],
      min: [0, "قيمة السعر غير صحيحة"],
      validate: {
        validator: isValidAmount,
        message: "قيمة السعر غير صحيحة",
      },
    },

    discountPerBottle: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "قيمة الخصم غير صحيحة"],
      validate: {
        validator: isValidAmount,
        message: "قيمة الخصم غير صحيحة",
      },
    },

    subtotal: {
      type: Number,
      required: [true, "المبلغ قبل الخصم مطلوب"],
      min: [0, "قيمة المبلغ غير صحيحة"],
      validate: {
        validator: isValidAmount,
        message: "قيمة المبلغ غير صحيحة",
      },
    },

    discountAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "قيمة الخصم الإجمالية غير صحيحة"],
      validate: {
        validator: isValidAmount,
        message: "قيمة الخصم الإجمالية غير صحيحة",
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "المبلغ المستحق مطلوب"],
      min: [0, "قيمة المبلغ غير صحيحة"],
      validate: {
        validator: isValidAmount,
        message: "قيمة المبلغ غير صحيحة",
      },
    },

    currency: {
      type: String,
      enum: ["SAR"],
      default: "SAR",
      immutable: true,
    },

    status: {
      type: String,
      enum: OrderStatuses,
      default: "pending",
      required: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [300, "سبب الإلغاء طويل جدًا"],
      required: [
        function () {
          return this.status === "cancelled";
        },
        "يرجى توضيح سبب إلغاء الطلب",
      ],
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  },
);

// Validate subscription links and financial consistency
orderSchema.pre("validate", function () {
  if (this.orderType === "subscription_delivery" && !this.subscription) {
    this.invalidate("subscription", "يجب ربط طلب الاشتراك باشتراك صحيح");
  }

  if (this.orderType === "one_time" && this.subscription) {
    this.invalidate("subscription", "لا يمكن ربط الطلب العادي باشتراك");
  }

  const hasValidQuantity =
    Number.isSafeInteger(this.quantity) && this.quantity > 0;

  const amounts = [
    this.unitPrice,
    this.discountPerBottle,
    this.subtotal,
    this.discountAmount,
    this.totalAmount,
  ];

  if (!hasValidQuantity || !amounts.every(Number.isFinite)) {
    return;
  }

  if (this.discountPerBottle > this.unitPrice) {
    this.invalidate("discountPerBottle", "بيانات الخصم غير صحيحة");
  }

  const expectedSubtotal = this.quantity * this.unitPrice;
  const expectedDiscount = this.quantity * this.discountPerBottle;
  const expectedTotal = expectedSubtotal - expectedDiscount;

  if (this.subtotal !== expectedSubtotal) {
    this.invalidate("subtotal", "بيانات إجمالي الطلب غير صحيحة");
  }

  if (this.discountAmount !== expectedDiscount) {
    this.invalidate("discountAmount", "بيانات الخصم غير صحيحة");
  }

  if (this.totalAmount !== expectedTotal) {
    this.invalidate("totalAmount", "بيانات المبلغ المستحق غير صحيحة");
  }
});

// Indexes for common order lookups
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({
  assignedDriver: 1,
  status: 1,
  createdAt: -1,
});
orderSchema.index({ subscription: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "customerInfo.phone": 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
