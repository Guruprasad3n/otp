const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const otpRouter = require("./routes/otpRouter");

connectDB();
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use("/api/otp", otpRouter)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
