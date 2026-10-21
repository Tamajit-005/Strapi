"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { type BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import BlogPagination from "@/components/Pagination";
import CategoryPills from "@/components/CategoryPills";
import { motion } from "framer-motion";


const TITLE_FONT = "font-[Helvetica_Neue,Helvetica,Arial,sans-serif]";

interface Props {
  initialPosts: BlogPost[];
  disableAutoScroll?: boolean;
}

/* ── Fallback palette (used when a post has no cardColor) ── */
const FALLBACK_COLORS = ["#EB4F2F", "#699EF6", "#C588BB", "#F6B12D", "#858B40", "#B26E5E"];
function fallbackColor(i: number) {
  return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
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

  /* Pair posts into rows, alternating the wide side */
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
      <div className="w-full px-5 pb-10 md:pb-14">
        <div className="mx-auto flex w-full max-w-273.75 flex-col items-center gap-3.5 lg:gap-0">
          {rows.map((pair, r) => (
            <div
              key={r}
              className="flex w-full max-w-81.25 flex-col items-center gap-3.5 lg:max-w-187.5 lg:flex-row lg:items-start lg:gap-x-25 lg:gap-y-0 xl:max-w-273.75"
            >
              {pair.map(({ post, index: i, wide }, pos) => {
                const color = post.cardColor || fallbackColor(i);
                /* Wide cards only exist from xl up; below that every card is narrow. */
                const wrapper = wide
                  ? pos === 0
                    ? "lg:mb-20 lg:justify-end xl:w-auto xl:flex-4"
                    : "lg:mt-20 lg:justify-start xl:mb-20 xl:w-auto xl:flex-4"
                  : pos === 0
                    ? "lg:justify-end xl:w-auto xl:flex-3"
                    : "lg:mt-20 lg:justify-start xl:w-auto xl:flex-3";

                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.45 }}
                    className={`flex w-81.25 max-w-full shrink-0 justify-center ${wrapper}`}
                  >
                    <Link
                      href={`/blogs/${post.slug}`}
                      scroll={false}
                      className={`group flex h-118.75 w-full flex-col rounded-2xl p-3.5 ${
                        wide ? "xl:max-w-167.5 xl:flex-row xl:gap-x-3.5" : "max-w-81.25"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      <div
                        className={`relative w-full shrink-0 overflow-hidden rounded-xl ${
                          wide ? "h-52.5 xl:h-full xl:w-77" : "h-52.5"
                        }`}
                      >
                        {post.image ? (
                          <img
                            src={urlFor(post.image).width(wide ? 700 : 600).url()}
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
                      <div
                        className={`flex min-h-0 flex-1 flex-col justify-between pt-3.5 ${
                          wide ? "xl:pb-0 xl:pt-0" : ""
                        }`}
                      >
                        <h3
                          className={`${TITLE_FONT} line-clamp-4 max-h-33.75 text-[35px] leading-8.25 font-semibold uppercase tracking-[-0.02em] text-black`}
                        >
                          {post.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between gap-x-3 pt-3">
                          <CategoryPills post={post} />
                        </div>
                      </div>
                    </Link>
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
            className="mt-20"
          >
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
