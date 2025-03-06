import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,  // Increase timeout
            socketTimeoutMS: 45000,         // Ensure enough time for queries
            maxPoolSize: 10,                // Optimize for serverless
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((mongoose) => {
                console.log("MongoDB connected");
                return mongoose;
            })
            .catch((err) => {
                console.error("MongoDB connection error:", err.message);
                cached.promise = null; // Reset promise for retry
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        throw new Error(`Database connection failed: ${err.message}`);
    }

    return cached.conn;
}

export default connectDB;
