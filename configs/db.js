import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI , opts)
            .then((mongoose) => mongoose)
            .catch((err) => {
                console.error("MongoDB connection error:", err);
                cached.promise = null; // Reset promise to allow retrying
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        throw new Error("Failed to connect to database");
    }

    return cached.conn;
}

export default connectDB;
