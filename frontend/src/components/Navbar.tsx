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
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use exact slugs and documentIds from your Strapi output
  const categories = [
    { label: "Gaming", slug: "gaming", documentId: "zxhivhcsvvo4bwsv8lrijpop" },
    { label: "Tech", slug: "tech", documentId: "icchgazsjbhc07ogtzksx6dq" },
    { label: "Food", slug: "food", documentId: "o5d6wlqkmmea2nkp17ziea7z" },
    { label: "Nature", slug: "nature", documentId: "kaigx15rehooagdlsb2q9x9k" },
    {
      label: "Culture",
      slug: "culture",
      documentId: "h1oaqs7skpgwx42u765xqrc2",
    },
    {
      label: "Entertainment",
      slug: "entertainment",
      documentId: "ynv7oa1i6v09tx54w7pfyrze",
    },
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

  const toggleDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <Link
            href="/"
            className="hover:text-teal-400 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            Blogs
          </Link>

          {/* Categories Dropdown */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setDropdownOpen(true);
            }}
            onMouseLeave={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(
                () => setDropdownOpen(false),
                200
              );
            }}
            onClick={toggleDropdown}
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
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute left-0 mt-2 bg-[#1a1c29] border border-gray-700 rounded-lg shadow-lg w-44 z-50"
                >
                  <ul className="py-2 text-sm">
                    {categories.map((c) => (
                      <li key={c.documentId}>
                        <Link
                          href={`/category/${encodeURIComponent(c.documentId)}`}
                          className="block px-4 py-2 hover:bg-teal-700 hover:text-white transition-colors"
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

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="text-xl hover:text-teal-400 transition-colors"
            aria-label="Open Search"
          >
            <FaSearch />
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#0f111a] px-4 pb-4 flex flex-col gap-3 overflow-hidden"
          >
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-gray-400 text-sm uppercase">
                Categories
              </span>
              {categories.map((c) => (
                <Link
                  key={c.documentId}
                  href={`/category/${encodeURIComponent(c.documentId)}`}
                  className="hover:text-teal-400 transition-colors pl-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-teal-400 transition-colors mt-2"
            >
              <FaSearch /> Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-5xl mx-auto px-4 overflow-hidden mt-4"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-white hover:text-teal-400 px-2"
                aria-label="Close Search"
              >
                <FaTimes />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
