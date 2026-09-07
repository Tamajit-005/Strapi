"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Anton } from "next/font/google";

const wordmark = Anton({ weight: "400", subsets: ["latin"] });

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?query=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [searchOpen]);

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
      <div className="fixed top-0 left-0 right-0 z-50 w-full px-3 pt-3 md:px-6 md:pt-4">
        <header className="mx-auto max-w-7xl rounded-full bg-black/30 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 md:h-16 px-4 md:px-6">
            {/* Left */}
            <div className="flex items-center justify-start gap-1 md:gap-2">
              <button
                onClick={() => setCatOpen(!catOpen)}
                aria-label={catOpen ? "Close categories" : "Open categories"}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <span className="relative block h-[18px] w-[18px]">
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
              <Link
                href="/about"
                className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] opacity-70 transition-opacity hover:opacity-100"
              >
                Get to know us
              </Link>
            </div>

            {/* Center wordmark */}
            <Link
              href="/"
              className={`${wordmark.className} text-2xl md:text-4xl uppercase leading-none tracking-wide whitespace-nowrap`}
            >
              Post Palette
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-1 md:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <Search size={18} />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.aside
              key="cat-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="fixed top-0 left-0 bottom-0 z-[95] w-72 md:w-80 bg-zinc-950 border-r border-white/10 flex flex-col px-7 pt-24 pb-8"
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
              <Link
                href="/about"
                onClick={() => setCatOpen(false)}
                className="mt-auto text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
              >
                Get to know us
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div key="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-start justify-center pt-32 px-4">
            <button onClick={() => setSearchOpen(false)} className="absolute top-6 right-6 text-2xl text-white">
              <FaTimes />
            </button>
            <motion.form onSubmit={handleSearchSubmit} initial={{ scale: 0.9, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input ref={inputRef} type="text" placeholder="Search blogs..." value={searchQuery} autoFocus onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-5 pl-12 text-xl rounded-full bg-zinc-900 text-white border border-white/10 focus:outline-none focus:border-white/25 outline-none" />
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
