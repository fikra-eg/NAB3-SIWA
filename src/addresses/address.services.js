import mongoose from "mongoose";
import AppError from "../utils/appError.js";
import Address from "./address.model.js";

const findOwnedAddress = async (addressId, userId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new AppError(404, "العنوان غير موجود");
  }

  const address = await Address.findOne({ _id: addressId, user: userId });

  if (!address) {
    throw new AppError("العنوان غير موجود", 404);
  }

  return address;
};

// Create a saved address and assign a default when needed
export const createAddress = async (userId, data) => {
  const hasDefaultAddress = await Address.exists({
    user: userId,
    isDefault: true,
  });

  try {
    return await Address.create({
      ...data,
      user: userId,
      isDefaut: !hasDefaultAddress,
    });
  } catch (error) {
    if (error.code !== 11000 || hasDefaultAddress) {
      throw error;
    }
    return Address.create({
      ...data,
      user: userId,
      isDefault: false,
    });
  }
};
export const getAddresses = async (userId) => {
  return Address.find({ user: userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
};

export const getAddressById = async (addressId, userId) => {
  const address = await findOwnedAddress(addressId, userId);

  return address.toObject();
};

// Update an address owned by the authenticated user
export const updateAddress = async (addressId, userId, data) => {
  const address = await findOwnedAddress(addressId, userId);

  Object.assign(address, data);

  return address.save();
};

// Set one of the user's addresses as the default
export const setDefaultAddress = async (addressId, userId) => {
  const address = await findOwnedAddress(addressId, userId);

  if (address.isDefault) {
    return address;
  }
  await Address.updateMany(
    {
      user: userId,
      isDefault: true,
      _id: { $ne: address._id },
    },
    {
      $set: { isDefault: false },
    },
  );

  address.isDefault = true;

  return address.save();
};

// Delete an address and promote another address if needed
export const deleteAddress = async (addressId, userId) => {
  const address = await findOwnedAddress(addressId, userId);
  const wasDefault = address.isDefault;

  await Address.deleteOne({
    _id: address._id,
    user: userId,
  });

  let defaultAddress = null;

  if (wasDefault) {
    defaultAddress = await Address.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (defaultAddress) {
      defaultAddress.isDefault = true;
      await defaultAddress.save();
    }
  }

  return {
    deletedAddressId: address._id,
    defaultAddress,
  };
};
