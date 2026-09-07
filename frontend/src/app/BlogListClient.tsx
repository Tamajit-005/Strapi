"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { type BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import BlogPagination from "@/components/Pagination";
import { motion } from "framer-motion";
import { Oswald } from "next/font/google";

const titleFont = Oswald({ weight: ["600", "700"], subsets: ["latin"] });

interface Props {
  initialPosts: BlogPost[];
  disableAutoScroll?: boolean;
}

/* ── Fallback palette (used when a post has no cardColor) ── */
const FALLBACK_COLORS = ["#EB4F2F", "#699EF6", "#C588BB", "#F6B12D", "#858B40", "#B26E5E"];
function fallbackColor(i: number) {
  return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

function CategoryPills({ post }: { post: BlogPost }) {
  if (!post.categories || post.categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2">
      {post.categories.map((cat) => (
        <span
          key={cat._id}
          className="inline-flex items-center h-9 px-3 rounded-full hover:rounded-lg transition-all duration-150 uppercase text-base leading-4.75 font-bold tracking-[-0.01em] text-black border border-black bg-transparent"
        >
          {cat.name}
        </span>
      ))}
    </div>
  );
}

export default function BlogListClient({ initialPosts, disableAutoScroll = false }: Props) {
  const [allPosts] = useState<BlogPost[]>(initialPosts);

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const parsedPage = parseInt(pageParam || "1");
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "10");

  /* Latest first */
  const sortedPosts = useMemo(() => {
    return [...allPosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }, [allPosts]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));

  const currentSlice = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPosts.slice(startIndex, startIndex + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  /* Pair posts into free rows, alternating the wide side */
  const rows = useMemo(() => {
    const out: { post: BlogPost; index: number; wide: boolean }[][] = [];
    currentSlice.forEach((post, i) => {
      const row = Math.floor(i / 2);
      const pos = i % 2;
      const wide = (row % 2 === 0 && pos === 0) || (row % 2 === 1 && pos === 1);
      if (pos === 0) out.push([]);
      out[row].push({ post, index: i, wide });
    });
    return out;
  }, [currentSlice]);

  /* Extremely slow ambient scroll: drifts down, then back up, looping.
     Pauses for a while whenever the user interacts. */
  useEffect(() => {
    if (disableAutoScroll) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SPEED = 32; // px per second — very slow but perceptible
    const RESUME_AFTER = 5000; // ms of calm before resuming
    let raf = 0;
    let dir: 1 | -1 = 1;
    let last = performance.now();
    let pausedUntil = 0;
    const pause = () => {
      pausedUntil = performance.now() + RESUME_AFTER;
    };
    const events = ["wheel", "touchstart", "touchmove", "keydown", "mousedown"];
    events.forEach((e) => window.addEventListener(e, pause, { passive: true }));
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (now >= pausedUntil) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0) {
          let y = window.scrollY + dir * SPEED * dt;
          if (y >= max) {
            y = max;
            dir = -1;
          } else if (y <= 0) {
            y = 0;
            dir = 1;
          }
          window.scrollTo(0, y);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      events.forEach((e) => window.removeEventListener(e, pause));
    };
  }, [disableAutoScroll]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    router.replace(`?${newParams.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!sortedPosts.length)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black">
        <p className="text-center text-gray-500 text-lg">No posts found.</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-black min-h-screen"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-270 mx-auto flex flex-col gap-10 md:gap-16">
          {rows.map((pair, r) => (
            <div
              key={r}
              className={`flex flex-col lg:flex-row gap-10 lg:gap-x-14 items-center lg:items-start ${
                r % 2 === 1 ? "xl:-mr-16" : "xl:-ml-16"
              }`}
            >
              {pair.map(({ post, index: i, wide }) => {
                const color = post.cardColor || fallbackColor(i);
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.45 }}
                    className={`${wide ? "lg:flex-1 lg:max-w-167.5" : "lg:w-81.25 lg:shrink-0"} w-full max-w-85 md:max-w-110 lg:max-w-none ${
                      wide ? "" : "lg:mt-20"
                    }`}
                  >
                    {wide ? (
                      /* ── Wide card: image left, title right ── */
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="group flex flex-col lg:flex-row h-118.75 rounded-2xl border border-black p-3.5 transition-transform duration-300 hover:-translate-y-1"
                        style={{ backgroundColor: color }}
                      >
                        <div className="relative w-full lg:w-1/2 shrink-0 overflow-hidden rounded-xl h-52.5 lg:h-auto">
                          {post.image ? (
                            <img
                              src={urlFor(post.image).width(700).url()}
                              alt={post.image.alt || ""}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                              <span className={`${titleFont.className} text-7xl uppercase text-black/25`}>
                                {post.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-h-0 px-0 pt-3.5 pb-0 lg:pt-0 lg:pl-3.5">
                          <h3 className={`${titleFont.className} text-8.75 leading-8.25 font-semibold uppercase tracking-[-0.02em] text-black line-clamp-4`}>
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto pt-3">
                            <CategoryPills post={post} />
                            {/* <span className="flex h-9 w-9 shrink-0 ml-3 items-center justify-center rounded-full border border-black text-xl font-light leading-none">+</span> */}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      /* ── Narrow card: image top, title below ── */
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="group flex flex-col h-118.75 rounded-2xl border border-black p-3.5 transition-transform duration-300 hover:-translate-y-1"
                        style={{ backgroundColor: color }}
                      >
                        {post.image ? (
                          <div className="relative w-full shrink-0 overflow-hidden rounded-xl h-52.5">
                            <img
                              src={urlFor(post.image).width(600).url()}
                              alt={post.image.alt || ""}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full shrink-0 flex items-center justify-center rounded-xl bg-black/15 h-52.5">
                            <span className={`${titleFont.className} text-7xl uppercase text-black/25`}>
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col flex-1 px-0 pt-3.5 pb-0">
                          <h3 className={`${titleFont.className} text-6.25 leading-6 font-bold uppercase tracking-[-0.04em] text-black line-clamp-4`}>
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto pt-3">
                            <CategoryPills post={post} />
                            {/* <span className="flex h-9 w-9 shrink-0 ml-3 items-center justify-center rounded-full border border-black text-xl font-light leading-none">+</span> */}
                          </div>
                        </div>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Pagination ── */}
        {sortedPosts.length > pageSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-14"
          >
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/"
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
