import mongoose from "mongoose";

/* =====================================================
   DATABASE CONNECTION
   Generic — kisi bhi project me MONGO_URI badal ke
   reuse ho sakta hai, koi hardcoded DB-name nahi.
===================================================== */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
