import mongoose, { Schema, Document } from "mongoose";
import { connectMongo } from "./mongo";

interface IBlogColor extends Document {
  slug: string;
  cardColor?: string;
}

const BlogColorSchema = new Schema<IBlogColor>(
  { slug: String, cardColor: String },
  { strict: false, collection: "blogs" }
);

export async function getCardColors(): Promise<Map<string, string>> {
  await connectMongo();
  const Model =
    mongoose.models.BlogColor ||
    mongoose.model<IBlogColor>("BlogColor", BlogColorSchema);
  const rows = await Model.find({ cardColor: { $exists: true, $ne: null } })
    .select("slug cardColor -_id")
    .lean();
  const map = new Map<string, string>();
  for (const r of rows) map.set(r.slug, r.cardColor!);
  return map;
}
