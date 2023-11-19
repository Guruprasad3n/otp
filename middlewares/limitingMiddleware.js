const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per windowMs
  message: {
    success: false,
    error: "Rate limit exceeded. Please try again later.",
  },
});
module.exports  = otpLimiter