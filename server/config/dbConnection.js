const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");
  } catch (error) {
    console.log("DB not connected", error);
    process.exit(1);
  }
};

module.exports = connectDB;
