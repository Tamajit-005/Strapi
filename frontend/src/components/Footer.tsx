import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import { Home, BookOpen, Info, Mail } from "lucide-react";

export default function Footer() {
  const categories = [
    { label: "Lifestyle", slug: "lifestyle" },
    { label: "Tech", slug: "tech" },
    { label: "Food", slug: "food" },
    { label: "Nature", slug: "nature" },
    { label: "Culture", slug: "culture" },
    { label: "Entertainment", slug: "entertainment" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#02050a] pt-12 text-gray-300">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
            <Link href="/" className="inline-block">
              <Image src="/images/Logo.webp" alt="Palette Publisher Logo" width={200} height={50} className="h-36 w-auto" priority />
            </Link>
            <p className="mt-5 text-[16px] leading-relaxed text-gray-300">A modern publishing platform for creators, storytellers, and dreamers. Your voice deserves the world.</p>
            <div className="mt-7 flex gap-4">
              <a href="https://x.com/tamajitsaha05" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 transition-all hover:bg-teal-500/20 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]"><FaTwitter size={20} /></a>
              <a href="https://github.com/Tamajit-005" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 transition-all hover:bg-teal-500/20 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]"><FaGithub size={20} /></a>
              <a href="https://www.instagram.com/tamajit005/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 transition-all hover:bg-teal-500/20 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]"><FaInstagram size={20} /></a>
            </div>
          </div>

          <div className="lg:col-span-3 lg:pl-8">
            <div className="mb-5 flex flex-col items-start gap-1.5">
              <h2 className="text-[19px] font-semibold text-white">Quick Links</h2>
              <div className="flex items-center gap-1.5"><span className="h-[2px] w-5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /><span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /></div>
            </div>
            <ul className="flex flex-col gap-5 mt-4">
              <li><Link href="/" className="group flex items-center gap-4 text-[16px] text-gray-200 transition hover:text-teal-300"><Home size={20} className="text-teal-400" />Home</Link></li>
              <li><Link href="/" className="group flex items-center gap-4 text-[16px] text-gray-200 transition hover:text-teal-300"><BookOpen size={20} className="text-teal-400" />Blogs</Link></li>
              <li><Link href="/about" className="group flex items-center gap-4 text-[16px] text-gray-200 transition hover:text-teal-300"><Info size={20} className="text-teal-400" />About</Link></li>
              <li><Link href="/contact" className="group flex items-center gap-4 text-[16px] text-gray-200 transition hover:text-teal-300"><Mail size={20} className="text-teal-400" />Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-5 flex flex-col items-start gap-1.5">
              <h2 className="text-[19px] font-semibold text-white">Categories</h2>
              <div className="flex items-center gap-1.5"><span className="h-[2px] w-5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /><span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /></div>
            </div>
            <ul className="flex flex-col gap-2 mt-4">
              {categories.map((c) => (
                <li key={c.slug}><Link href={`/category/${encodeURIComponent(c.slug)}`} className="text-[15px] text-gray-400 hover:text-teal-300 transition">{c.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block lg:col-span-3">
            <div className="relative mt-2 h-full rounded-[20px] border border-white/5 bg-[rgba(255,255,255,0.02)] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <span className="absolute -left-2 -top-2 text-6xl text-teal-400">"</span>
              <p className="relative z-10 text-[17px] italic leading-relaxed text-gray-300">Words have power. Stories have impact. You have something worth sharing.</p>
              <p className="mt-5 text-[14px] font-semibold text-teal-400">— Keep Publishing</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.04] pb-8 pt-6 text-center text-[14px] text-gray-500 sm:text-[15px]">© {new Date().getFullYear()} <span className="font-medium text-teal-400">Palette Publisher</span>. All rights reserved.</div>
      </div>
    </footer>
  );
}
