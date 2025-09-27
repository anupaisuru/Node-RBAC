const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/dbConnection");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

//import routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");

//routes
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);

PORT = process.env.PORT || 7002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
