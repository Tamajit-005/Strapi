"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/* Reference sans (Neue Montreal) is proprietary — closest system stack. */
const TITLE_FONT = "font-[Helvetica_Neue,Helvetica,Arial,sans-serif]";
const LABEL = "font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase text-white/50";

const team = [
  { initial: "T", name: "Tamajit", color: "#F6B12D" },
  { initial: "M", name: "Mayukh", color: "#699EF6" },
];

const stack = ["Next.js", "Sanity", "GROQ", "Cloudflare"];

const topics = [
  "Full-stack development with modern tooling",
  "Performance optimization and caching strategies",
  "API design, GraphQL, and headless CMS workflows",
  "Shipping real applications on free-tier infrastructure",
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-black text-white"
    >
      <div className="mx-auto w-full max-w-360 px-5 pt-0 pb-10 md:px-10 md:pt-8.75 md:pb-14">
        {/* Hero */}
        <header className="mb-15 grid gap-x-10 gap-y-8 md:grid-cols-2 md:items-end">
          <div>
            <p className={LABEL}>About Post Palette</p>
            <h1
              className={`${TITLE_FONT} mt-4 text-[35px] leading-8.25 font-bold tracking-[-0.02em] uppercase md:text-[50px] md:leading-11.75 md:tracking-[-1px]`}
            >
              Get to know us
            </h1>
          </div>
          <p className="max-w-155 text-[18px] leading-7 text-white/70">
            Welcome to <span className="text-white">Post Palette</span> — a platform built by
            students, for students. We share practical knowledge, development workflows, and
            solutions to real problems faced while building modern web applications.
          </p>
        </header>

        {/* Team */}
        <section className="mb-20">
          <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-4">
            <p className={LABEL}>Who&rsquo;s behind it</p>
            <p className={LABEL}>Two students</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {team.map((member, i) => (
              <article
                key={member.name}
                className="flex min-h-65 flex-col justify-between rounded-2xl p-7 text-black"
                style={{ backgroundColor: member.color }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`${TITLE_FONT} text-[72px] leading-none font-semibold uppercase`}
                  >
                    {member.initial}
                  </span>
                  <span className="font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-16">
                  <h2
                    className={`${TITLE_FONT} text-[35px] leading-8.25 font-semibold tracking-[-0.02em] uppercase`}
                  >
                    {member.name}
                  </h2>
                  <p className="mt-2 font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase">
                    B.Tech student · Web development
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mb-20 grid gap-x-10 gap-y-8 md:grid-cols-[1fr_2fr]">
          <p className={LABEL}>Our story</p>
          <div className="max-w-155 space-y-6 text-[17px] leading-7 text-white/70">
            <p>
              We are <span className="text-white">Tamajit</span> and{" "}
              <span className="text-white">Mayukh</span>, two B.Tech students passionate about web
              development, system design, and building real-world applications beyond textbooks.
            </p>
            <p>
              This platform started as a learning project but quickly evolved into a space where we
              share practical knowledge, development workflows, and solutions to real problems
              faced while building modern web applications.
            </p>
            <p>
              During development, we faced challenges like optimizing API usage under strict
              limits, implementing caching strategies, handling ISR (Incremental Static
              Regeneration), and ensuring real-time updates without compromising performance.
            </p>
            <p>
              Instead of relying on repeated backend calls, we designed a system that uses smart
              caching and static generation — making the platform fast, efficient, and
              production-ready even on free-tier services.
            </p>
            <p className="border-l-2 border-white/30 pl-6 text-[22px] leading-7 text-white">
              We believe learning should go beyond theory. It should involve building,
              experimenting, failing, and improving — and this platform reflects exactly that
              journey.
            </p>
          </div>
        </section>

        {/* Stack + topics */}
        <section className="grid gap-x-10 gap-y-12 md:grid-cols-2">
          <div>
            <p className={LABEL}>Built with</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {stack.map((item) => (
                <span
                  key={item}
                  className="flex h-9 items-center justify-center rounded-full border border-white px-3 font-serif text-[12px] leading-3.75 tracking-[0.01em] whitespace-nowrap uppercase"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-125 text-[15px] leading-6 text-white/50">
              Chosen for performance, scalability, and efficient data handling. The platform is
              built to stay fast and production-ready even on free-tier infrastructure.
            </p>
          </div>

          <div>
            <p className={LABEL}>What we write about</p>
            <ol className="mt-4 border-t border-white/15">
              {topics.map((topic, i) => (
                <li key={topic} className="flex items-baseline gap-5 border-b border-white/15 py-4">
                  <span className="font-serif text-[12px] leading-3.75 text-white/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`${TITLE_FONT} text-[18px] leading-5 font-semibold tracking-[-0.01em] uppercase md:text-[20px]`}
                  >
                    {topic}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center">
          <p
            className={`${TITLE_FONT} text-[24px] leading-7 font-semibold tracking-[-0.01em] uppercase md:text-[28px]`}
          >
            Read what we&rsquo;re building.
          </p>
          <Link
            href="/"
            className="flex h-11 items-center gap-2 rounded-full border border-white px-5 font-serif text-[13px] leading-3.75 tracking-[0.01em] uppercase transition-colors duration-300 hover:bg-white hover:text-black"
          >
            Explore the blog <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
