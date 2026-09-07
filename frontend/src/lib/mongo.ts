import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global as typeof globalThis & { mongoose: typeof mongoose | null };
if (!cached.mongoose) cached.mongoose = null;

export async function connectMongo() {
  if (cached.mongoose) return cached.mongoose;
  cached.mongoose = await mongoose.connect(MONGODB_URI);
  return cached.mongoose;
}
