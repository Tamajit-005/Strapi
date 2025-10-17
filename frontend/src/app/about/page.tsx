"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-screen-md mx-auto p-4">
      <h1 className="text-4xl font-bold text-purple-800 mb-6 text-center">
        About{" "}
        <span className="fruktur-regular text-3xl md:text-4xl text-purple-600 font-bold tracking-wide hover:text-purple-400 transition-all">
          TOM.BLOG
        </span>
      </h1>

      <p className="teblack-300 leading-relaxed mb-4">
        <strong>TOM.BLOG</strong> is your go-to resource for all things Strapi
        and web development. Our mission is to provide practical tutorials,
        insights, and tips to help developers build amazing projects.
      </p>

      <p className="text-black-300 leading-relaxed mb-4">
        This platform is designed to be a community-driven hub where developers
        can share knowledge, explore new techniques, and stay up-to-date with
        the latest trends in web development.
      </p>

      <p className="text-black-300 leading-relaxed mb-4">
        Built with Next.js and Strapi, <strong>TOM.BLOG</strong> leverages
        modern web technologies for a smooth, fast, and interactive experience.
      </p>

      <p className="text-black-300 leading-relaxed">
        We hope you enjoy reading our posts and learning from our tutorials.
        Feel free to connect with us or explore other pages to discover more.
      </p>
    </div>
  );
}
