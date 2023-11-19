const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const otpRouter = require("./routes/otpRouter");
const { cleanupOtps } = require("./controllers/otpController");

connectDB();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/otp", otpRouter);

// Create a middleware to log request counts
// app.use((req, res, next) => {
//   // Log or store request information for analysis
//   console.log(`Request from ${req.ip} for ${req.originalUrl}`);

//   // Continue to the next middleware or route handler
//   next();
// });

setInterval(cleanupOtps, 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
