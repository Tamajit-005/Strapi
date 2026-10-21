import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global as typeof globalThis & { mongoose: typeof mongoose | null };
if (!cached.mongoose) cached.mongoose = null;

export async function connectMongo() {
  if (cached.mongoose) return cached.mongoose;
  // Card colors are optional: fail in seconds instead of the 30s default, so a
  // dead MongoDB cannot stall every page render on the cold path.
  cached.mongoose = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
    bufferCommands: false,
  });
  return cached.mongoose;
}
