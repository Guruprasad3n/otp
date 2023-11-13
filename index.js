// server.js (or index.js)
const express = require("express");
// const bodyParser = require('body-parser');
const twilio = require("twilio");
// const OTPModel = require("./OTPSchema");
const connectDB = require("./db");
const OtpModel = require("./OTPSchema");
const dotenv = require("dotenv").config();

connectDB();
const app = express();
const port = 3000;

app.use(express.json());

const accountSid = "AC73413742637bc4ab558dadd5b072dbc6";
const authToken = "989d160b7f18f565c930d6a96edb4dae";

const client = twilio(accountSid, authToken);

// Generate OTP

app.post("/api/otp/generate", async (req, res) => {
  try {
    const { identifier } = req.body;

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio SMS
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      to: identifier, // Replace with the user's mobile number
      from: "+14022898276", // Replace with your Twilio phone number
    });

    // Save OTP to the database
    const otpRecord = await OtpModel.findOne({ identifier });

    if (otpRecord) {
      // Add the new OTP to the existing array
      otpRecord.otpList.push({
        otp,
        expiry: new Date(Date.now() + 10 * 60 * 1000),
      }); // 10 minutes expiration
      await otpRecord.save();
    } else {
      // Create a new OTP record if the user doesn't exist
      const sendOTP = new OtpModel({
        identifier,
        otpList: [{ otp, expiry: new Date(Date.now() + 10 * 60 * 1000) }], // 10 minutes expiration
      });
      await sendOTP.save();
    }

    console.log("OTP sent successfully:", message.sid);

    res
      .status(200)
      .json({ message: "OTP sent successfully", otpSid: message.sid });
  } catch (error) {
    console.error("Error generating OTP:", error);

    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

// Verify OTP endpoint
// app.post("/api/otp/verify", async (req, res) => {
//   try {
//     const { identifier, userEnteredOTP } = req.body;

//     // Find the OTP record in the database
//     const otpRecord = await OtpModel.findOne({ identifier }).sort({ createdAt: 1 });

//     console.log(otpRecord)

//     if (!otpRecord) {
//       return res.status(404).json({ error: "OTP not found", message: "Please generate a new OTP." });
//     }

//     // Check if the OTP has expired
//     if (otpRecord.otpList[0].expiry < new Date()) {
//       return res.status(400).json({ error: "OTP expired", message: "Please generate a new OTP." });
//     }

//     // Check if the entered OTP matches the stored OTP
//     if (otpRecord.otpList[0].otp === userEnteredOTP) {
//       // Mark the OTP as verified
//       otpRecord.otpList[0].verified = true;
//       await otpRecord.save();

//       return res.status(200).json({ message: "OTP verified successfully" });
//     } else {
//       return res.status(400).json({ error: "Invalid OTP", message: "Please enter a valid OTP." });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ error: "Internal server error", message: error.message });
//   }
// });


app.post("/api/otp/verify", async (req, res) => {
  try {
    const { identifier, userEnteredOTP } = req.body;

    // Find the OTP record in the database
    const otpRecord = await OtpModel.findOne({ identifier });

    if (!otpRecord || !otpRecord.otpList || otpRecord.otpList.length === 0) {
      return res.status(404).json({ error: "OTP not found", message: "Please generate a new OTP." });
    }

    // Sort the otpList array to get the latest OTP
    otpRecord.otpList.sort((a, b) => b.createdAt - a.createdAt);

    const latestOTP = otpRecord.otpList[0];

    // Calculate expiration time (2 minutes from creation)
    const expirationTime = new Date(latestOTP.createdAt.getTime() + 5 * 60 * 1000);

    // Check if the OTP has expired
    if (expirationTime < new Date()) {
      return res.status(400).json({ error: "OTP expired", message: "Please generate a new OTP." });
    }

    // Check if the entered OTP matches the stored OTP
    if (latestOTP.otp === userEnteredOTP) {
      // Mark the OTP as verified
      latestOTP.verified = true;
      await otpRecord.save();

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid OTP", message: "Please enter a valid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});







// app.post("/api/otp/verify", async(req, res) => {
//   try {
//     const { identifier, otp } = req.body;

//     // Retrieve the stored OTP for the provided identifier
//     const storedOTP = await OtpModel.findOne({identifier, otp});

//     if (!storedOTP) {
//       return res.status(400).json({ message: "Invalid identifier" });
//     }

//     if (otp == storedOTP) {
//       // OTP is valid
//       res.status(200).json({ message: "OTP verified successfully" });
//     } else {
//       // Invalid OTP
//       res.status(400).json({ message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

app.listen(port, () => {
  // await connectDB
  console.log(`Server is running on port http://localhost:${port}`);
});

////////////////////////////////////////////////
// Working COde
////////////////////////////////////////////////
// app.post("/api/otp/generate", async (req, res) => {
//   try {
//     const { identifier } = req.body;

//     // Generate a random 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Send OTP via Twilio SMS
//     const message = await client.messages.create({
//       body: `Your OTP is: ${otp}`,
//       to: identifier, // Replace with the user's mobile number
//       from: "+14022898276", // Replace with your Twilio phone number
//     });

//     // Save OTP to the database
//     const sendOTP = new OtpModel({ identifier, otp });
//     await sendOTP.save();

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

////////////////////////////////////////////////

// const express = require('express');
// const OtpModel = require('./OTPSchema');
// const twilio = require('twilio');
// const connectDB = require('./db');
// const dotenv = require('dotenv').config();
// const client = require("twilio")(accountSid, authToken)

// connectDB();

// const app = express();
// const port = 3000;

// // Twilio credentials (replace with your own)
// const accountSid = 'AC73413742637bc4ab558dadd5b072dbc6';
// const authToken = '989d160b7f18f565c930d6a96edb4dae';
// const verifySid = 'VA76d813450a16ee07d51b700a6f83a0a1';
// const twilioClient = new twilio(accountSid, authToken);
// const twilioPhoneNumber = '+919505416130';

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Generate OTP
// app.post('/api/otp/generate', async (req, res) => {
//   // const { identifier } = req.body;
//   // const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   // const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

//   try {
//     const otpData = new OtpModel({ identifier });
//     await otpData.save();

//     // Send OTP via Twilio Verify API
//     await twilioClient.verify.services(verifySid)
//       .verifications.create({ to: identifier, channel: 'sms' });

//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Verify OTP
// app.post('/api/otp/verify', async (req, res) => {
//   const { identifier, otp } = req.body;

//   try {
//     const otpData = await OtpModel.findOne({ identifier, otp, expiry: { $gt: new Date() } });
//     if (otpData) {
//       // Verify OTP via Twilio Verify API
//       const verificationCheck = await twilioClient.verify.services(verifySid)
//         .verificationChecks.create({ to: identifier, code: otp });

//       if (verificationCheck.status === 'approved') {
//         res.status(200).json({ message: 'OTP is valid' });
//       } else {
//         res.status(400).json({ error: 'Invalid OTP' });
//       }
//     } else {
//       res.status(400).json({ error: 'Invalid OTP' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Set Rate Limits
// // (Add rate-limiting logic here)

// // Check Rate Limit
// // (Add rate-limiting logic here)

// // Remove Expired OTPs
// app.delete('/api/otp/cleanup', async (req, res) => {
//   try {
//     await OtpModel.deleteMany({ expiry: { $lt: new Date() } });
//     res.status(200).json({ message: 'Expired OTPs removed successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Get Request Count
// (Add request counting logic here)

// Track Request Source
// (Add request tracking logic here)

// app.listen(port, () => {
//   console.log(`Server is running on port http://localhost:${port}`);
// });

// const express = require('express');
// const OtpModel = require("./OTPSchema")
// const twilio = require('twilio');
// const mongoose = require('mongoose');
// const dotenv = require("dotenv").config()
// const connectDB = require("./db")
// connectDB()

// const app = express();
// const port = 3000;

// // Twilio credentials (replace with your own)
// const accountSid = 'AC73413742637bc4ab558dadd5b072dbc6';
// const authToken = '989d160b7f18f565c930d6a96edb4dae';
// const twilioClient = new twilio(accountSid, authToken);
// const twilioPhoneNumber = '+919505416130';

// // Connect to MongoDB using Mongoose

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Generate OTP
// app.post('/api/otp/generate', async (req, res) => {
//   const { identifier } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

//   try {
//     const otpData = new OtpModel({ identifier, otp, expiry });
//     await otpData.save();

//     // Send OTP via Twilio
//     await twilioClient.messages.create({
//       body: `Your OTP is: ${otp}`,
//       to: identifier,
//       from: twilioPhoneNumber,
//     });

//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Verify OTP
// app.post('/api/otp/verify', async (req, res) => {
//   const { identifier, otp } = req.body;

//   try {
//     const otpData = await OtpModel.findOne({ identifier, otp, expiry: { $gt: new Date() } });
//     if (otpData) {
//       res.status(200).json({ message: 'OTP is valid' });
//     } else {
//       res.status(400).json({ error: 'Invalid OTP' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Set Rate Limits
// // (Add rate-limiting logic here)

// // Check Rate Limit
// // (Add rate-limiting logic here)

// // Remove Expired OTPs
// app.delete('/api/otp/cleanup', async (req, res) => {
//   try {
//     await OtpModel.deleteMany({ expiry: { $lt: new Date() } });
//     res.status(200).json({ message: 'Expired OTPs removed successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Get Request Count
// // (Add request counting logic here)

// // Track Request Source
// // (Add request tracking logic here)

// app.listen(port, () => {
//     // mongoose.connect(`mongodb://localhost:27017/OTPNew`)

//   console.log(`Server is running on port http://localhost:${port}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// // const twilio = require('twilio');

// const app = express();
// const port = 3000;

// // Twilio credentials (replace with your own)
// const accountSid = 'AC73413742637bc4ab558dadd5b072dbc6';
// const authToken = '989d160b7f18f565c930d6a96edb4dae';
// const twilioClient = new twilio(accountSid, authToken);
// const twilioPhoneNumber = '+918329532666';

// // Connect to MongoDB using Mongoose
// mongoose.connect('mongodb://localhost:27017/otpDB', { useNewUrlParser: true, useUnifiedTopology: true });
// const otpSchema = new mongoose.Schema({
//   identifier: String,
//   otp: String,
//   expiry: Date,
// });
// const OtpModel = mongoose.model('Otp', otpSchema);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Generate OTP
// app.post('/api/otp/generate', async (req, res) => {
//   const { identifier } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

//   try {
//     const otpData = new OtpModel({ identifier, otp, expiry });
//     await otpData.save();

//     // Send OTP via Twilio
//     await twilioClient.messages.create({
//       body: `Your OTP is: ${otp}`,
//       to: identifier,
//       from: twilioPhoneNumber,
//     });

//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Verify OTP
// app.post('/api/otp/verify', async (req, res) => {
//   const { identifier, otp } = req.body;

//   try {
//     const otpData = await OtpModel.findOne({ identifier, otp, expiry: { $gt: new Date() } });
//     if (otpData) {
//       res.status(200).json({ message: 'OTP is valid' });
//     } else {
//       res.status(400).json({ error: 'Invalid OTP' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Set Rate Limits
// // (Add rate-limiting logic here)

// // Check Rate Limit
// // (Add rate-limiting logic here)

// // Remove Expired OTPs
// app.delete('/api/otp/cleanup', async (req, res) => {
//   try {
//     await OtpModel.deleteMany({ expiry: { $lt: new Date() } });
//     res.status(200).json({ message: 'Expired OTPs removed successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Get Request Count
// // (Add request counting logic here)

// // Track Request Source
// // (Add request tracking logic here)

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// const express = require("express");
// const mongoose = require("mongoose");

// const app = express();
// const port = 3000;

// // Connect to MongoDB using Mongoose
// mongoose.connect("mongodb://localhost:27017/otpDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const otpSchema = new mongoose.Schema({
//   identifier: String,
//   otp: String,
//   expiry: Date,
// });
// const OtpModel = mongoose.model("Otp", otpSchema);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Generate OTP
// app.post("/api/otp/generate", async (req, res) => {
//   const { identifier } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

//   try {
//     const otpData = new OtpModel({ identifier, otp, expiry });
//     await otpData.save();
//     res.status(200).json({ otp });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Verify OTP
// app.post("/api/otp/verify", async (req, res) => {
//   const { identifier, otp } = req.body;

//   try {
//     const otpData = await OtpModel.findOne({
//       identifier,
//       otp,
//       expiry: { $gt: new Date() },
//     });
//     if (otpData) {
//       res.status(200).json({ message: "OTP is valid" });
//     } else {
//       res.status(400).json({ error: "Invalid OTP" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Set Rate Limits
// // (Add rate-limiting logic here)

// // Check Rate Limit
// // (Add rate-limiting logic here)

// // Remove Expired OTPs
// app.delete("/api/otp/cleanup", async (req, res) => {
//   try {
//     await OtpModel.deleteMany({ expiry: { $lt: new Date() } });
//     res.status(200).json({ message: "Expired OTPs removed successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Get Request Count
// // (Add request counting logic here)

// // Track Request Source
// // (Add request tracking logic here)

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
