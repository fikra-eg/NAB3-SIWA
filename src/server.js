// server.js: Starts the application after loading the environment and connecting to the database.

import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

startServer();
