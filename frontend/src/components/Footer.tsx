import Link from "next/link";
import { Anton } from "next/font/google";

const wordmark = Anton({ weight: "400", subsets: ["latin"] });

const categories = [
  { label: "Lifestyle", slug: "lifestyle" },
  { label: "Tech", slug: "tech" },
  { label: "Food", slug: "food" },
  { label: "Nature", slug: "nature" },
  { label: "Culture", slug: "culture" },
  { label: "Entertainment", slug: "entertainment" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="w-full px-5 md:px-10 bg-black text-white">
      <div className="flex flex-col md:flex-row md:justify-between gap-y-10 mt-[60px] md:mt-20 mb-[100px]">
        {/* Left — logo only */}
        <Link href="/" className={`${wordmark.className} inline-block origin-left text-5xl md:text-7xl uppercase leading-none tracking-wide transition-transform duration-300 hover:scale-[1.03]`}>
          Post Palette
        </Link>

        {/* Right — two parts */}
        <div className="flex gap-16 md:gap-24">
          {/* Left part — categories */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50 mb-5">
              Categories
            </p>
            <ul className="flex flex-col gap-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${encodeURIComponent(c.slug)}`}
                    className="relative w-fit text-lg md:text-xl font-semibold uppercase tracking-wider transition-transform duration-300 hover:translate-x-1.5 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right part — quick links */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50 mb-5">
              Quick links
            </p>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="relative w-fit text-lg md:text-xl font-semibold uppercase tracking-wider transition-transform duration-300 hover:translate-x-1.5 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
