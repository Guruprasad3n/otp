const express = require("express");

const { generateOtp, verifyOtp } = require("../controllers/otpController");
const otpLimiter = require("../middlewares/limitingMiddleware");
const router = express.Router();

router.post("/generate", otpLimiter, generateOtp);
router.post("/verify", verifyOtp);

module.exports = router;
