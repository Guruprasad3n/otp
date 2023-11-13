const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Detabase Connected");
  } catch (e) {
    console.log(`Error in MongoDB ${e}`);
  }
};
module.exports = connectDB;
