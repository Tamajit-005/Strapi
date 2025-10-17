import Link from "next/link";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="bg-[#0f111a] text-gray-300 py-10 border-t border-gray-800">
      <div className="max-w-screen-lg mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Link href="/">
            <h1 className="fruktur-regular text-3xl md:text-4xl text-purple-600 font-bold tracking-wide hover:text-purple-400 transition-all">
              TOM.BLOG
            </h1>
          </Link>
          <p className="mt-2 text-sm text-gray-400">
            Your go-to Strapi & WebDev blog.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-white mb-2">Quick Links</h2>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/" className="hover:text-purple-400 transition">
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-purple-400 transition">
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-purple-400 transition"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h2 className="font-semibold text-white mb-2">Follow Us</h2>
          <div className="flex gap-4">
            <a
              href="https://x.com/tamajitsaha05"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://github.com/Tamajit-005"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://www.instagram.com/tamajit005/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition"
            >
              <AiFillInstagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TOM.BLOG. All rights reserved.
      </div>
    </footer>
  );
}
