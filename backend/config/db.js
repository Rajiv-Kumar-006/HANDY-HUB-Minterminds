// config/connectDB.js
const mongoose = require("mongoose");
require("dotenv").config();

const createAdmin = require("../utils/createAdmin");
const seedServices = require("../utils/seed/serviceSeederFile");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    await createAdmin();
    await seedServices();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
