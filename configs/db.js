import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!process.env.MONGODB_URI) {
            throw new Error("❌ MONGODB_URI is not defined in environment variables");
        }

        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
            .then((mongoose) => {
                console.log("✅ MongoDB connected successfully");
                return mongoose;
            })
            .catch((err) => {
                console.error("❌ MongoDB connection error:", err);
                cached.promise = null; // Reset promise to allow retrying
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        throw new Error("❌ Failed to connect to database");
    }

    return cached.conn;
}

export default connectDB;
