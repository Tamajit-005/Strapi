"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaTimes, FaBars } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const categories = [
    { label: "Gaming", documentId: "zxhivhcsvvo4bwsv8lrijpop" },
    { label: "Tech", documentId: "icchgazsjbhc07ogtzksx6dq" },
    { label: "Food", documentId: "o5d6wlqkmmea2nkp17ziea7z" },
    { label: "Nature", documentId: "kaigx15rehooagdlsb2q9x9k" },
    { label: "Culture", documentId: "h1oaqs7skpgwx42u765xqrc2" },
    { label: "Entertainment", documentId: "ynv7oa1i6v09tx54w7pfyrze" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?query=${encodeURIComponent(q)}`);
    }
    setSearchOpen(false);
    setMenuOpen(false);
  };

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [searchOpen]);

  // ESC closes search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Prevent both menu and search open
  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <header className="bg-[#0f111a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" onClick={() => setDropdownOpen(false)}>
          <Image
            src="/images/Logo.png"
            alt="Logo"
            width={200}
            height={50}
            className="h-12 w-auto md:h-16"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <Link
            href="/"
            className="hover:text-teal-400 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            Blogs
          </Link>

          {/* Categories */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setDropdownOpen(true);
            }}
            onMouseLeave={() => {
              timeoutRef.current = setTimeout(
                () => setDropdownOpen(false),
                200,
              );
            }}
          >
            <button className="hover:text-teal-400 transition-colors">
              Categories
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 bg-[#1a1c29] border border-gray-700 rounded-lg shadow-lg w-44 z-50"
                >
                  <ul className="py-2 text-sm">
                    {categories.map((c) => (
                      <li key={c.documentId}>
                        <Link
                          href={`/category/${encodeURIComponent(c.documentId)}`}
                          className="block px-4 py-2 hover:bg-teal-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <button onClick={openSearch} className="text-xl hover:text-teal-400">
            <FaSearch />
          </button>
        </nav>

        {/* Mobile Right Controls */}
        <div className="md:hidden flex items-center gap-4 text-xl">
          <button
            onClick={openSearch}
            className="hover:text-teal-400 transition-colors"
            aria-label="Open Search"
          >
            <FaSearch />
          </button>

          <button
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((prev) => !prev);
            }}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#0f111a] px-4 pb-4 flex flex-col gap-3 shadow-lg z-50"
          >
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-gray-400 text-sm uppercase">
                Categories
              </span>
              {categories.map((c) => (
                <Link
                  key={c.documentId}
                  href={`/category/${encodeURIComponent(c.documentId)}`}
                  className="hover:text-teal-400 pl-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN SEARCH */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-100 flex items-start justify-center pt-32 px-4"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 text-2xl"
            >
              <FaTimes />
            </button>

            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-5 text-xl rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-teal-500"
              />
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
