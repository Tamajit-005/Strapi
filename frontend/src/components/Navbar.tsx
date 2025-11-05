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

  // Category data as per your backend keys
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

  // Prevent body scrolling behind open overlays
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen, searchOpen]);

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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full h-full bg-[#0f111a] px-4 pb-4 z-99 flex flex-col gap-3 overflow-y-auto md:hidden"
          >
            {/* Close button */}
            <button
              className="self-end mt-4 text-2xl text-white hover:text-teal-400 transition"
              onClick={() => setMenuOpen(false)}
              aria-label="Close Menu"
            >
              <FaTimes />
            </button>

            <div className="flex flex-col gap-1 mt-2">
              <span className="text-gray-400 text-sm uppercase">
                Categories
              </span>
              {categories.map((c) => (
                <Link
                  key={c.documentId}
                  href={`/category/${encodeURIComponent(c.documentId)}`}
                  className="hover:text-teal-400 transition-colors pl-2 py-2 text-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => {
                setSearchOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 hover:text-teal-400 transition-colors mt-4 text-lg"
            >
              <FaSearch /> Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-modal"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-md px-6"
            >
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-5 pr-14 rounded-full bg-gray-800 text-xl text-white shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
              {/* Submit search */}
              <button
                type="submit"
                className="absolute right-9 top-1/2 -translate-y-1/2 text-teal-400 text-2xl hover:text-teal-300 transition"
                aria-label="Submit Search"
              >
                <FaSearch />
              </button>
              {/* Close search */}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute -top-10 right-2 text-white text-2xl hover:text-red-500 transition"
                aria-label="Close Search"
                tabIndex={0}
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
