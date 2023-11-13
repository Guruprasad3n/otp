const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
  identifier: String,
  otpList: [
    {
      otp: String,
      expiry: Date,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const OtpModel = model("OTP", otpSchema);

module.exports = OtpModel;

// const OtpSchema = new mongoose.Schema(
//   {
//     appId: { type: mongoose.Schema.Types.ObjectId, ref: "AppSchema" }, // Corrected the reference type
//     sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
//     identifier: String,
//     identifierType: {
//       type: String,
//       enum: ["email", "mobile"],
//     },
//     passwords: [
//       {
//         code: { type: Number },
//         requestedAt: { type: Date, default: Date.now }, // Corrected the timestamps syntax
//         expiresAt: { type: Date }, // Corrected the timestamps syntax
//         verified: { type: Boolean },
//         serviceProvider: { type: String },
//         serviceProviderResponse: { type: mongoose.Schema.Types.Mixed }, // Corrected the field name and type
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// const { Schema, model } = require("mongoose");

// const otpSchema = new Schema({
//   identifier: String,
//   otp: String,
//   expiry: Date,
// });

// const OtpModel = model("OTP", otpSchema);

// module.exports = OtpModel;

// const OtpSchema = new Schema(
//   {
//     // _id: String,
//     appId: { _id: id, ref: "AppSchema" },
//     identifier: String,
//     identifierType: {
//       type: String,
//       enum: ["email", "mobile"],
//     },
//     password: [
//       {
//         code: { type: Number },
//         requestedAt: { timestamps: true },
//         expiresAt: { timestamps: true },
//         verified: { type: Boolean },
//         serviceProvider: { type: String },
//         serviceProviderRespone: { type: Document },
//       },
//     ],
//     otp: {
//       type: Number,
//     },
//     expiry: {
//       type: Date,
//     },
//     createdAt: { type: Date, default: Date.now() },
//     updatedAt: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// passwords:[{code{}, requestedAt:{timestamp:true}, expiresAt:Timestamp,verified:Boolean,serviceProvider:string,serviceProviderRespone:Doc}],
