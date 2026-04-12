import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/apolloClient";
import { clearBuildCache } from "@/lib/buildCache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  await client.clearStore();
  clearBuildCache();

  revalidatePath("/");
  revalidatePath("/blogs/[slug]", "page");
  revalidatePath("/category/[documentId]", "page");
  revalidatePath("/search");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}