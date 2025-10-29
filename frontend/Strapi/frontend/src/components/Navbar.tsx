"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaSearch, FaTimes, FaBars } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="bg-[#0f111a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="fruktur-regular text-3xl md:text-4xl text-purple-600 font-bold tracking-wide hover:text-purple-400 transition-all">
            TOM.BLOG
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            Blogs
          </Link>
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="text-xl hover:text-purple-400 transition-colors"
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

      {/* Mobile Menu Animation */}
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
            <Link
              href="/"
              className="hover:text-purple-400 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Blogs
            </Link>
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
            >
              <FaSearch /> Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar Animation */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-screen-lg mx-auto px-4 overflow-hidden mt-4"
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
                className="flex-1 p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-white hover:text-purple-400 px-2"
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
