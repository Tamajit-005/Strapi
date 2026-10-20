"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CategoryPills from "@/components/CategoryPills";
import BlogPagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import type { BlogPost, Category } from "@/lib/types";
import { urlFor } from "@/sanity/image";

const TITLE_FONT = "font-[Helvetica_Neue,Helvetica,Arial,sans-serif]";

/* ── Fallback palette (used when a post has no cardColor) ── */
const FALLBACK_COLORS = ["#EB4F2F", "#699EF6", "#C588BB", "#F6B12D", "#858B40", "#B26E5E"];
function fallbackColor(i: number) {
  return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

interface Props {
  title: string;
  posts: BlogPost[];
  categories: Category[];
  /** Filter posts by the `query` URL param (search page). */
  filter?: boolean;
  /** Show the inline search bar (search page only; the navbar has its own). */
  showSearch?: boolean;
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const color = post.cardColor || fallbackColor(index);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4 }}
      className="flex w-full justify-center"
    >
      <Link
        href={`/blogs/${post.slug}`}
        scroll={false}
        className="group flex h-118.75 w-81.25 max-w-full flex-col gap-y-3.5 rounded-2xl p-3.5"
        style={{ backgroundColor: color }}
      >
        <div className="relative h-52.5 w-full shrink-0 overflow-hidden rounded-xl">
          {post.image ? (
            <img
              src={urlFor(post.image).width(600).url()}
              alt={post.image.alt || ""}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <span className={`${TITLE_FONT} text-7xl font-semibold uppercase text-black/25`}>
                {post.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <h3
            className={`${TITLE_FONT} line-clamp-4 max-h-33.75 text-[35px] leading-8.25 font-semibold uppercase tracking-[-0.02em] text-black`}
          >
            {post.title}
          </h3>
          {post.description && (
            <p
              className={`${TITLE_FONT} mt-2 line-clamp-2 text-[18px] leading-4.25 font-bold uppercase tracking-[-0.04em] text-black`}
            >
              {post.description}
            </p>
          )}
        </div>
        <CategoryPills post={post} />
      </Link>
    </motion.div>
  );
}

export default function PostBrowser({
  title,
  posts,
  categories,
  filter = false,
  showSearch = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = filter ? (searchParams.get("query") || "").trim() : "";
  const [searchValue, setSearchValue] = useState(urlQuery);

  useEffect(() => setSearchValue(urlQuery), [urlQuery]);

  const query = urlQuery.toLowerCase();
  const results = query
    ? posts.filter((post) =>
        [post.title, post.description, ...(post.categories ?? []).flatMap((cat) => [cat.name, cat.slug])].some(
          (text) => text?.toLowerCase().includes(query),
        ),
      )
    : posts;

  const pills = categories.slice(0, 4);

  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "10");
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const parsedPage = parseInt(searchParams.get("page") || "1");
  const pageFromUrl = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const currentPage = Math.min(pageFromUrl, totalPages);
  const visiblePosts = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (pageFromUrl <= totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(totalPages));
    router.replace(`${pathname}?${params.toString()}`);
  }, [pageFromUrl, totalPages, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const q = searchValue.trim();
    router.push(q ? `/search?query=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <div className="mx-auto w-full max-w-360 px-5 pt-0 pb-10 md:px-10 md:pt-8.75 md:pb-14">
      <header className="mb-15 flex flex-col justify-between md:flex-row md:items-start">
        <h1
          className={`${TITLE_FONT} w-full text-[35px] leading-8.25 font-bold tracking-[-0.02em] uppercase transition-colors md:max-w-162.5 md:text-[50px] md:leading-11.75 md:tracking-[-1px] ${
            showSearch ? "mb-4 md:mb-0" : "mb-0"
          }`}
        >
          {title}
        </h1>

        {showSearch && (
          <div className="flex w-full flex-col items-start gap-y-3 md:max-w-155">
            <SearchBar value={searchValue} onChange={setSearchValue} onSubmit={handleSubmit} />

            {pills.length > 0 && (
              <div className="flex w-full flex-wrap justify-end gap-1">
                {pills.map((cat, i) => (
                  <Link
                    key={cat._id}
                    href={`/search?query=${encodeURIComponent(cat.name)}`}
                    className={`${i === 3 ? "hidden md:flex" : "flex"} h-9 items-center justify-center rounded-full border border-white px-3 font-serif text-[12px] leading-3.75 tracking-[0.01em] whitespace-nowrap uppercase transition-all duration-300 hover:rounded-lg`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 justify-items-center gap-x-5 gap-y-3.5 md:grid-cols-2 lg:grid-cols-3 lg:justify-between lg:gap-y-20 xl:grid-cols-4">
            {visiblePosts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))}
          </div>

          {results.length > pageSize && (
            <div className="mt-20">
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <p className="py-16 text-center text-lg text-white/50">
          {query ? `No posts found for “${urlQuery}”.` : "No posts found."}
        </p>
      )}
    </div>
  );
}
