// const cleanupOtps = async () => {
//   // Remove verified OTPs
//   await OtpModel.updateMany(
//     { "passwords.verified": true },
//     { $pull: { passwords: { verified: true } } }
//   );

//   // Remove expired OTPs older than 2 days
//   const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
//   await OtpModel.updateMany(
//     { "passwords.expiresAt": { $lt: twoDaysAgo } },
//     { $pull: { passwords: { expiresAt: { $lt: twoDaysAgo } } } }
//   );
// };

// // Call the cleanup function at a regular interval, for example, every hour
// setInterval(cleanupOtps, 60 * 60 * 1000);

// // module.exports = cleanupOtps;
