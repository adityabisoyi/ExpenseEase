import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
    try {
        const dbConnection = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_NAME}`
        );
        console.log(
            "MongoDB connected !!! Host : ",
            dbConnection.connection.host
        );
    } catch (error) {
        console.log("MongoDB connection error : ", error);
        process.exit(1);
    }
};

export default dbConnect;
