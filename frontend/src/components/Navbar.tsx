"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { Anton } from "next/font/google";
import SearchBar from "@/components/SearchBar";

const wordmark = Anton({ weight: "400", subsets: ["latin"] });

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const router = useRouter();

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?query=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCatOpen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const categories = [
    { label: "Lifestyle", slug: "lifestyle" },
    { label: "Tech", slug: "tech" },
    { label: "Food", slug: "food" },
    { label: "Nature", slug: "nature" },
    { label: "Culture", slug: "culture" },
    { label: "Entertainment", slug: "entertainment" },
  ];

  return (
    <>
      <div className="fixed top-5 left-0 right-0 z-50 w-full px-5">
        <header className="w-full rounded-2xl bg-black/60 text-white backdrop-blur-md">
          <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5 md:h-17">
            {/* Left */}
            <div className="flex items-center justify-start gap-2">
              <button
                onClick={() => setCatOpen(!catOpen)}
                aria-label={catOpen ? "Close categories" : "Open categories"}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <span className="relative block h-4.5 w-4.5">
                  <Menu
                    size={18}
                    className={`absolute inset-0 transition-all duration-300 ${catOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                  />
                  <X
                    size={18}
                    className={`absolute inset-0 transition-all duration-300 ${catOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                  />
                </span>
              </button>
              <div className="hidden items-center gap-8 lg:flex">
                <Link
                  href="/about"
                  className="font-serif text-[16px] leading-4.75 font-medium tracking-[0.02em] uppercase transition-opacity hover:opacity-70"
                >
                  Get to know us
                </Link>
                <Link
                  href="/contact"
                  className="font-serif text-[16px] leading-4.75 font-medium tracking-[0.02em] uppercase transition-opacity hover:opacity-70"
                >
                  Contact us
                </Link>
              </div>
            </div>

            {/* Center wordmark */}
            <Link
              href="/"
              className={`${wordmark.className} text-[32px] uppercase leading-none tracking-wide whitespace-nowrap`}
            >
              Post Palette
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Category drawer sliding in from the left */}
      <AnimatePresence>
        {catOpen && (
          <>
            <motion.div
              key="cat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCatOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90"
            />
            <motion.aside
              key="cat-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="fixed top-0 left-0 bottom-0 z-95 w-72 md:w-80 bg-zinc-950 border-r border-white/10 flex flex-col px-7 pt-24 pb-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mb-6">
                Categories
              </p>
              <nav className="flex flex-col gap-1">
                {categories.map((c, i) => (
                  <motion.div
                    key={c.slug}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={`/category/${encodeURIComponent(c.slug)}`}
                      onClick={() => setCatOpen(false)}
                      className={`${wordmark.className} block text-3xl md:text-4xl uppercase leading-tight text-white/80 hover:text-white hover:translate-x-2 transition-all duration-200`}
                    >
                      {c.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto flex flex-col items-start gap-4">
                <Link
                  href="/contact"
                  onClick={() => setCatOpen(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
                >
                  Contact us
                </Link>
                <Link
                  href="/about"
                  onClick={() => setCatOpen(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
                >
                  Get to know us
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              key="search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, scale: 0.6, x: 48, y: -16 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, x: 48, y: -16 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ transformOrigin: "top right" }}
              className="fixed top-5 right-5 z-101 w-[calc(100%-2.5rem)] max-w-155"
            >
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                autoFocus
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
