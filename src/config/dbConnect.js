import mongoose from "mongoose";
import "dotenv";

export const startDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://didorenkodiana72:oa9uM2uj6stoNy56@cluster0.icbjntj.mongodb.net/shopKing?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDb Connected");
  } catch (error) {
    console.error("Error Connecting to MongoDb", error);
    process.exit(1);
  }
};
