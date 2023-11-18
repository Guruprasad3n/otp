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

// app.post("/api/otp/generate", async (req, res) => {
//   try {
//     const { identifier } = req.body;

//     // Generate a random 6-digit OTP
//     const code = Math.floor(100000 + Math.random() * 900000);

//     // Get the current time in IST
//     const currentTimeIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

//     // Send OTP via Twilio SMS
//     const message = await client.messages.create({
//       body: `Your OTP is: ${code}`,
//       to: identifier, // Replace with the user's mobile number
//       from: "+14022898276", // Replace with your Twilio phone number
//     });

//     // Save OTP and current time in IST to the database
//     const otpRecord = await OtpModel.findOne({ identifier });

//     if (otpRecord) {
//       // Add the new OTP to the existing array
//       otpRecord.passwords.push({
//         code,
//         expiresAt: new Date(currentTimeIST) + 10 * 60 * 1000,
//         requestedAt: currentTimeIST, // Save current time in IST
//       }); // 10 minutes expiration
//       await otpRecord.save();
//     } else {
//       // Create a new OTP record if the user doesn't exist
//       const sendOTP = await new OtpModel({
//         identifier,
//         passwords: [{
//           code,
//           expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//           requestedAt: currentTimeIST, // Save current time in IST
//         }], // 10 minutes expiration
//       });
//       await sendOTP.save();
//     }

//     console.log("OTP sent successfully:", message.sid);

//     res
//       .status(200)
//       .json({ message: "OTP sent successfully", otpSid: message.sid });
//   } catch (error) {
//     console.error("Error generating OTP:", error);

//     res
//       .status(500)
//       .json({ error: "Internal server error", message: error.message });
//   }
// });

// // //////////////////////////////////

// app.post("/api/otp/verify", async (req, res) => {
//   try {
//     const { identifier, userEnteredOTP } = req.body;

//     // Find the OTP record in the database
//     const otpRecord = await OtpModel.findOne({ identifier });

//     if (!otpRecord || !otpRecord.passwords || otpRecord.passwords.length === 0) {
//       return res.status(404).json({
//         error: "OTP not found",
//         message: "Please generate a new OTP.",
//       });
//     }

//     // Sort the otpList array to get the latest OTP
//     otpRecord.passwords.sort((a, b) => b.requestedAt - a.requestedAt);

//     const latestOTP = otpRecord.passwords[0];
//     console.log(latestOTP)

//     // Calculate expiration time (10 minutes from creation)
//     const expirationTime = new Date(new Date(latestOTP.requestedAt).getTime() + 10 * 60 * 1000);

//     // Convert expirationTime to IST
//     const expirationTimeIST = expirationTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

//     // Get the current time in IST
//     const currentTimeIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

//     // Check if the OTP has expired
//     if (new Date(expirationTimeIST) < new Date(currentTimeIST)) {
//       return res.status(400).json({
//         error: "OTP expired",
//         message: "Please generate a new OTP.",
//       });
//     }

//     // Check if the entered OTP matches the stored OTP
//     if (latestOTP.code === userEnteredOTP) {
//       // Mark the OTP as verified
//       latestOTP.verified = true;

//       // Save the updated OTP record
//       await otpRecord.save();

//       return res.status(200).json({
//         message: "OTP verified successfully",
//       });
//     } else {
//       return res.status(400).json({
//         error: "Invalid OTP",
//         message: "Please enter a valid OTP.",
//       });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       message: error.message,
//     });
//   }
// });
