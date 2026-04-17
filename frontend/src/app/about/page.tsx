"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full min-h-screen bg-slate-950 text-gray-300 py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h1 className="text-4xl font-bold text-teal-500">About Us</h1>
          <Image
            src="/images/Logo.png"
            alt="Logo"
            width={160}
            height={50}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="space-y-6 text-lg leading-relaxed text-gray-400">
          <p>
            Welcome to <strong className="text-teal-400">POST PALETTE</strong> —
            a platform built by students, for students.
          </p>

          <p>
            We are <span className="text-teal-400 font-medium">Tamajit</span>{" "}
            and <span className="text-teal-400 font-medium">Mayukh</span>, two
            B.Tech students passionate about web development, system design, and
            building real-world applications beyond textbooks.
          </p>

          <p>
            This platform started as a learning project but quickly evolved into
            a space where we share practical knowledge, development workflows,
            and solutions to real problems faced while building modern web
            applications.
          </p>

          <p>
            Built using{" "}
            <span className="text-teal-400 font-medium">Next.js</span>,{" "}
            <span className="text-teal-400 font-medium">Strapi</span>,{" "}
            <span className="text-teal-400 font-medium">GraphQL</span>, and{" "}
            <span className="text-teal-400 font-medium">Cloudflare</span>, this
            project focuses heavily on performance, scalability, and efficient
            data handling.
          </p>

          <p>
            During development, we faced challenges like optimizing API usage
            under strict limits, implementing caching strategies, handling ISR
            (Incremental Static Regeneration), and ensuring real-time updates
            without compromising performance.
          </p>

          <p>
            Instead of relying on repeated backend calls, we designed a system
            that uses smart caching and static generation — making the platform
            fast, efficient, and production-ready even on free-tier services.
          </p>

          <p>
            We believe learning should go beyond theory. It should involve
            building, experimenting, failing, and improving — and this platform
            reflects exactly that journey.
          </p>

          <div className="mt-6">
            <h2 className="text-xl text-teal-400 font-semibold mb-2">
              What we write about
            </h2>
            <ul className="space-y-2">
              <li>🛠️ Full-stack development with modern tooling</li>
              <li>⚡ Performance optimization and caching strategies</li>
              <li>📡 API design, GraphQL, and headless CMS workflows</li>
              <li>🚀 Shipping real applications on free-tier infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <a
            href="/"
            className="text-teal-500 font-medium hover:text-teal-300 hover:underline transition"
          >
            Explore our latest blogs →
          </a>
        </div>
      </div>
    </motion.div>
  );
}
