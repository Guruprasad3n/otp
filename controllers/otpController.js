const twilio = require("twilio");
const OtpModel = require("../models/OTPSchema");

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";

const client = twilio(accountSid, authToken);

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 15;

const generateOtp = async (req, res) => {
  try {
    const { identifier } = req.body;

    // Check if the user is temporarily locked out
    const lockedUser = await OtpModel.findOne({
      identifier,
      lockoutUntil: { $gt: new Date() },
    });

    if (lockedUser) {
      const lockoutRemainingMinutes = Math.ceil(
        (lockedUser.lockoutUntil - new Date()) / (60 * 1000)
      );

      return res.status(400).send({
        success: false,
        error: "Verification Limit Exceeded",
        message: `You have exceeded the maximum verification attempts. Please try again after ${lockoutRemainingMinutes} minutes.`,
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio SMS
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      to: `+91${identifier}`, // Replace with the user's mobile number
      from: "+14022898276", // Replace with your Twilio phone number
    });

    // Save OTP to the database
    const otpRecord = await OtpModel.findOne({ identifier });

    if (otpRecord) {
      // Add the new OTP to the existing array
      otpRecord.passwords.push({
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
      });
      otpRecord.failedAttempts = 0;
      await otpRecord.save();
    } else {
      // Create a new OTP record if the user doesn't exist
      const sendOTP = new OtpModel({
        identifier,
        passwords: [
          { code: otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes expiration
        ],
        failedAttempts: 0,
      });
      await sendOTP.save();
    }

    console.log("OTP sent successfully:", message.sid);

    res.status(200).send({
      message: "OTP sent successfully",
      otpSid: message.sid,
      success: true,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);

    res.status(500).send({
      error: "Internal server error",
      message: error.message,
      success: false,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { identifier, userEnteredOTP } = req.body;

    // Find the OTP record in the database
    const otpRecord = await OtpModel.findOne({ identifier });

    if (
      !otpRecord ||
      !otpRecord.passwords ||
      otpRecord.passwords.length === 0
    ) {
      return res.status(404).send({
        success: false,
        error: "OTP not found",
        message: "Please generate a new OTP.",
      });
    }

    // Check if the account is locked due to too many failed attempts
    if (otpRecord.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutEndTime = new Date(otpRecord.lockoutUntil);

      if (lockoutEndTime > new Date()) {
        const remainingLockoutTime = Math.ceil(
          (lockoutEndTime - new Date()) / (LOCKOUT_DURATION_MINUTES * 60 * 1000)
        );

        return res.status(403).send({
          success: false,
          error: "Account locked",
          message: `Too many failed attempts. Try again after ${remainingLockoutTime} minutes.`,
        });
      } else {
        // Reset lockout timestamp and failed attempts if the lockout period has passed
        otpRecord.failedAttempts = 0;
        otpRecord.lockoutUntil = null;
      }
    }

    // Access the latest OTP directly using $slice
    const latestOTP = otpRecord.passwords.slice(-1)[0];

    // Check if the OTP has already been verified
    if (latestOTP.verified) {
      return res.status(400).send({
        success: false,
        error: "Invalid OTP",
        message: "This OTP has already been used.",
      });
    }

    // Calculate expiration time (15 minutes from creation)
    const expirationTime = new Date(
      latestOTP.expiresAt.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000
    );

    // Check if the OTP has expired
    if (expirationTime < new Date()) {
      return res.status(400).send({
        success: false,
        error: "OTP expired",
        message: "Please generate a new OTP.",
      });
    }

    // Check if the entered OTP matches the stored OTP
    if (latestOTP.code === userEnteredOTP) {
      // Mark the OTP as verified
      latestOTP.verified = true;
      otpRecord.failedAttempts = 0;
      otpRecord.lockoutUntil = null;
    } else {
      // Increment failed attempts
      otpRecord.failedAttempts += 1;

      if (otpRecord.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        otpRecord.lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
      }
    }

    await otpRecord.save();

    // Respond based on the verification result
    if (latestOTP.verified) {
      return res.status(200).send({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      // Include information about lockout in the response
      const response = {
        success: false,
        error: "Invalid OTP",
        message: "Please enter a valid OTP.",
      };

      if (otpRecord.lockoutUntil) {
        const remainingLockoutTime = Math.ceil(
          (otpRecord.lockoutUntil - new Date()) / (60 * 1000) // convert milliseconds to minutes
        );
        response.lockout = {
          until: otpRecord.lockoutUntil,
          remainingTime: remainingLockoutTime,
        };
      }

      return res.status(400).send(response);
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

const cleanupOtps = async () => {
  // Remove verified OTPs
  await OtpModel.updateMany(
    { "passwords.verified": true },
    { $pull: { passwords: { verified: true } } }
  );

  // Remove expired OTPs older than 2 days
  const twoDaysAgo = new Date(Date.now() - 0 * 24 * 60 * 60 * 1000);
  await OtpModel.updateMany(
    { "passwords.expiresAt": { $lt: twoDaysAgo } },
    { $pull: { passwords: { expiresAt: { $lt: twoDaysAgo } } } }
  );
};

// Call the cleanup function at a regular interval, for example, every hour

module.exports = { generateOtp, verifyOtp, cleanupOtps };

// =========================================================================================
// Working Code
// =========================================================================================

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
