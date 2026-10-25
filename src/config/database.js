//Manages the connection between the backend and MongoDB

import mongoose from "mongoose";

export const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("DataBase Connected");
  } catch (error) {
    console.log(error.message);

    throw error;
  }
};
