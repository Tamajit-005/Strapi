import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/apolloClient";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  // Clear Apollo's InMemoryCache so next fetch goes to Strapi fresh
  await client.clearStore();

  // Clear Next.js route cache
  revalidatePath("/");
  revalidatePath("/blogs/[slug]", "page");
  revalidatePath("/category/[documentId]", "page");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}