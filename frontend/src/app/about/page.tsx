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
          <h1 className="text-4xl font-bold text-teal-500">About</h1>
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
            <strong className="text-teal-400">POST PALETTE</strong> is your hub
            for Strapi, backend workflows, and modern web development. Built to
            deliver clean guides, real-world examples, and practical dev-focused
            solutions.
          </p>

          <p>
            Our platform is a{" "}
            <span className="text-teal-400 font-medium">
              community-driven space
            </span>{" "}
            where developers explore better patterns, share insights, and push
            the boundaries of modern web practices.
          </p>

          <p>
            Powered by{" "}
            <span className="text-teal-400 font-medium">Next.js</span> and{" "}
            <span className="text-teal-400 font-medium">Strapi</span>,{" "}
            <strong className="text-teal-400">POST PALETTE</strong> ensures a
            performance-first, modern browsing experience.
          </p>

          <p>
            Dive into our tutorials, understand complex topics through simple
            breakdowns, and sharpen your skills in building scalable,
            production-ready applications.
          </p>
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
