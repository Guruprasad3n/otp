const { Schema, model } = require("mongoose");

const otpSchema = new Schema(
  {
    identifier: String,
    passwords: [
      {
        code: { type: Number },
        expiresAt: { type: Date },
        verified: { type: Boolean, default: false },
        requestedAt: { type: Date, default: Date.now },
        serviceProvider: { type: String },
        serviceProviderResponse: { type: Schema.Types.Mixed },
      },
    ],
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const OtpModel = model("OTP", otpSchema);

module.exports = OtpModel;
