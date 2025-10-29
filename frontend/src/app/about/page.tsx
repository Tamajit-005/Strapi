"use client";

import React from "react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-gray-300 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl bg-gray-900 shadow-lg rounded-lg p-8 md:p-10">
        <h1 className="text-4xl font-bold text-teal-500 mb-6 text-center flex items-center justify-center gap-3">
          About
          <Image
            src="/images/Logo.png"
            alt="Logo"
            width={200}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </h1>

        <p className="text-gray-400 leading-relaxed mb-5 text-lg">
          <strong className="text-teal-400">POST PALETTE</strong> is your go-to
          resource for all things Strapi and web development. Our mission is to
          provide practical tutorials, insightful guides, and detailed tips to
          help developers of all skill levels build outstanding digital
          experiences.
        </p>

        <p className="text-gray-400 leading-relaxed mb-5 text-lg">
          This platform is a{" "}
          <span className="text-teal-400 font-medium">
            community-driven hub
          </span>{" "}
          where developers share knowledge, explore innovative techniques, and
          stay updated with the latest technologies in web development.
        </p>

        <p className="text-gray-400 leading-relaxed mb-5 text-lg">
          Built using <span className="text-teal-400 font-medium">Next.js</span>{" "}
          and <span className="text-teal-400 font-medium">Strapi</span>,{" "}
          <strong className="text-teal-400">POST PALETTE</strong> harnesses
          modern web frameworks to create a fast, smooth, and immersive user
          experience.
        </p>

        <p className="text-gray-400 leading-relaxed text-lg">
          We hope you enjoy exploring our content and learning through our
          tutorials. Feel free to connect with us or dive into other sections of
          the site to discover more about building better web applications with
          vibrant and modern technologies.
        </p>

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block text-teal-500 font-medium hover:text-teal-300 hover:underline transition-all"
          >
            Explore our latest blogs →
          </a>
        </div>
      </div>
    </div>
  );
}
