const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
  identifier: String,
  passwords: [
    {
      code: { type: Number },
      requestedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date },
      verified: { type: Boolean, default:false },
      // serviceProvider: { type: String },
      // serviceProviderResponse: { type: Schema.Types.Mixed },
    },
  ],
},{
  timestamps: true,
});

const OtpModel = model("OTP", otpSchema);

module.exports = OtpModel;