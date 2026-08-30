"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Info, Mail, Search, ChevronDown } from "lucide-react";
import { FaSearch, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const inputRef = useRef<HTMLInputElement>(null);
  const catTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { label: "Lifestyle", slug: "lifestyle" },
    { label: "Tech", slug: "tech" },
    { label: "Food", slug: "food" },
    { label: "Nature", slug: "nature" },
    { label: "Culture", slug: "culture" },
    { label: "Entertainment", slug: "entertainment" },
  ];

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
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const navLinks = [
    { href: "/", label: "Blogs", icon: BookOpen },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#02050a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="relative flex h-[88px] md:h-24 items-center">
            <Link href="/" className="flex shrink-0 items-center transition-all duration-500 hover:scale-[1.02] hover:opacity-95">
              <img src="/images/Logo.webp" alt="Palette Publisher" className="h-[72px] md:h-[88px] w-auto object-contain drop-shadow-[0_0_18px_rgba(45,212,191,0.22)] lg:h-[112px]" />
            </Link>

            <nav className="hidden md:flex items-center gap-1 px-2 py-2 md:ml-auto lg:ml-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.label} href={link.href} className="group relative rounded-[18px] px-5 py-2.5 text-[15px] font-medium tracking-wide transition-all duration-300 ease-out hover:px-7 hover:py-4 hover:rounded-[24px] hover:z-20" style={{ transformOrigin: "center center" }}>
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300" style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", filter: "url(#glass-blur)", zIndex: 0 }} />
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.28),0_0_28px_rgba(0,0,0,0.16)]" style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.18), 0 0 14px rgba(0,0,0,0.10)", zIndex: 1 }} />
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300" style={{ boxShadow: active ? "inset 3px 3px 3px 0 rgba(45,212,191,0.35), inset -3px -3px 3px 0 rgba(255,255,255,0.30)" : "inset 3px 3px 3px 0 rgba(255,255,255,0.38), inset -3px -3px 3px 0 rgba(255,255,255,0.38)", zIndex: 2 }} />
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ boxShadow: "0 0 18px 4px rgba(45,212,191,0.45), 0 0 40px 8px rgba(45,212,191,0.18), inset 2px 2px 4px rgba(255,255,255,0.55), inset -2px -2px 4px rgba(45,212,191,0.25)", background: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.18) 0%, rgba(45,212,191,0.08) 60%, transparent 100%)", zIndex: 3 }} />
                    {active && <motion.span layoutId="desktop-navbar-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "rgba(45,212,191,0.18)", boxShadow: "0 0 18px rgba(45,212,191,0.35), inset 0 0 10px rgba(255,255,255,0.12)", zIndex: 4 }} />}
                    <span className={`relative transition-all duration-300 ${active ? "text-teal-300" : "text-white/80"} group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(45,212,191,0.9)]`} style={{ position: "relative", zIndex: 10 }}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}

              <div className="relative" onMouseEnter={() => { if (catTimeoutRef.current) clearTimeout(catTimeoutRef.current); setCatOpen(true); }} onMouseLeave={() => { catTimeoutRef.current = setTimeout(() => setCatOpen(false), 200); }}>
                <button className="group relative rounded-[18px] px-5 py-2.5 text-[15px] font-medium tracking-wide text-white/80 transition-all duration-300 ease-out hover:px-7 hover:py-4 hover:rounded-[24px] hover:z-20 hover:text-white flex items-center gap-1.5">
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", filter: "url(#glass-blur)", zIndex: 0 }} />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.28),0_0_28px_rgba(0,0,0,0.16)]" style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.18), 0 0 14px rgba(0,0,0,0.10)", zIndex: 1 }} />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 3px 3px 3px 0 rgba(255,255,255,0.38), inset -3px -3px 3px 0 rgba(255,255,255,0.38)", zIndex: 2 }} />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ boxShadow: "0 0 18px 4px rgba(45,212,191,0.45), 0 0 40px 8px rgba(45,212,191,0.18), inset 2px 2px 4px rgba(255,255,255,0.55), inset -2px -2px 4px rgba(45,212,191,0.25)", background: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.18) 0%, rgba(45,212,191,0.08) 60%, transparent 100%)", zIndex: 3 }} />
                  <span className="relative flex items-center gap-1.5" style={{ zIndex: 10 }}>
                    Categories <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-xl z-50">
                      <ul className="py-2 text-sm">
                        {categories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/category/${encodeURIComponent(c.slug)}`} onClick={() => setCatOpen(false)} className="block px-4 py-2 text-white/80 hover:bg-teal-500/20 hover:text-white transition">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={openSearch} aria-label="Search" className="group relative rounded-[18px] p-2.5 text-white/70 hover:text-white transition-all flex items-center justify-center ml-1">
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", filter: "url(#glass-blur)", zIndex: 0 }} />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" style={{ zIndex: 1 }} />
                <FaSearch className="relative z-10" />
              </button>
            </nav>

            <div className="flex items-center gap-2 md:hidden ml-auto">
              <button onClick={openSearch} className="p-2 text-white/70 hover:text-white" aria-label="Search">
                <FaSearch />
              </button>
            </div>
          </div>

          <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-4 px-1 [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link key={link.label} href={link.href} className="relative flex shrink-0 items-center gap-2 rounded-[14px] px-3 py-2.5 text-[14px]">
                  {active && <motion.div layoutId="mobile-nav-indicator" className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-t-full bg-teal-400 shadow-[0_-2px_8px_rgba(45,212,191,0.6)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  <Icon size={16} className={active ? "text-teal-300" : "text-white/50"} />
                  <span className={active ? "text-teal-300 font-medium" : "text-white/70"}>{link.label}</span>
                </Link>
              );
            })}
            <button onClick={() => setCatOpen(!catOpen)} className="flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[14px] text-white/70 hover:text-teal-400 transition-colors">
              <BookOpen size={16} />
              <span>Categories</span>
              <ChevronDown size={12} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>
            <button onClick={openSearch} className="flex shrink-0 items-center gap-2 px-3 py-2.5 text-white/70">
              <Search size={16} /> Search
            </button>
          </nav>

          {/* Mobile categories dropdown */}
          <AnimatePresence>
            {catOpen && (
              <motion.div
                key="mobile-categories"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden border-b border-white/[0.06]"
              >
                <div className="grid grid-cols-2 gap-1 px-2 py-3">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${encodeURIComponent(c.slug)}`}
                      onClick={() => setCatOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm text-white/80 hover:bg-teal-500/15 hover:text-teal-300 transition"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div key="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-start justify-center pt-32 px-4">
            <button onClick={() => setSearchOpen(false)} className="absolute top-6 right-6 text-2xl text-white">
              <FaTimes />
            </button>
            <motion.form onSubmit={handleSearchSubmit} initial={{ scale: 0.9, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
              <input ref={inputRef} type="text" placeholder="Search blogs..." value={searchQuery} autoFocus onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-5 text-xl rounded-xl bg-gray-900 text-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <svg style={{ display: "none" }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <filter id="glass-blur" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.007" numOctaves="1" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="200" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
};

export default Navbar;
