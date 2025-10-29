import Link from "next/link";
import { FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
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

  return (
    <footer className="bg-[#0f111a] text-gray-300 py-10 border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Logo and Info */}
        <div>
          <Link href="/">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={200}
              height={50}
              className="h-12 w-auto md:h-13"
              priority
            />
          </Link>
          <p className="mt-2 text-sm text-gray-400">
            Your go-to Strapi & WebDev blog.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-semibold text-white mb-2">Quick Links</h2>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/" className="hover:text-teal-400 transition">
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-teal-400 transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-teal-400 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h2 className="font-semibold text-white mb-2">Categories</h2>
          <ul className="flex flex-col gap-1">
            {categories.map((c) => (
              <li key={c.documentId}>
                <Link
                  href={`/category/${encodeURIComponent(c.documentId)}`}
                  className="hover:text-teal-400 transition"
                  prefetch={false}
                >
                  {c.label}
                </Link>
              </li>
            ))}
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
              className="hover:text-teal-400 transition"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://github.com/Tamajit-005"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://www.instagram.com/tamajit005/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} POST PALETTE. All rights reserved.
      </div>
    </footer>
  );
}
