import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/apolloClient";
import { clearBuildCache, getAllCategories } from "@/lib/buildCache";

async function purgeCloudflareCache(paths: string[]) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.warn("⚠️ Cloudflare credentials missing");
    return { success: false, error: "missing credentials" };
  }

  const files = paths.map((p) => `https://postpalette.online${p}`);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    }
  );

  const data = await res.json();
  console.log("Cloudflare purge result:", JSON.stringify(data));
  return data;
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = body?.entry?.slug as string | undefined;
  const categoryDocIds = (body?.entry?.category ?? []) as { documentId: string }[];

  // 1. Clear in-memory + Apollo cache
  await client.clearStore();
  clearBuildCache();

  /* 2. Fetch all categories fresh AFTER clearing cache
        Safety net: Strapi webhooks sometimes send empty category arrays
        on republish/unpublish events — this ensures all category pages
        always get purged regardless of what the webhook body contains.*/
  const allCategories = await getAllCategories();

  // 3. Revalidate Vercel ISR
  revalidatePath("/");
  revalidatePath("/blogs/[slug]", "page");
  revalidatePath("/category/[documentId]", "page");
  revalidatePath("/search");

  // 4. Build Cloudflare purge list using a Set to avoid duplicates
  const pathsToPurge = new Set<string>(["/", "/search"]);

  if (slug) pathsToPurge.add(`/blogs/${slug}`);

  for (const cat of categoryDocIds) {
    pathsToPurge.add(`/category/${cat.documentId}`);
  }

  // Also purge all category pages to be safe, since we can't trust the webhook payload
  for (const cat of allCategories) {
    pathsToPurge.add(`/category/${cat.documentId}`);
  }

  const cfResult = await purgeCloudflareCache([...pathsToPurge]);

  return NextResponse.json({
    revalidated: true,
    purged: [...pathsToPurge],
    cloudflare: cfResult,
    now: Date.now(),
  });
}