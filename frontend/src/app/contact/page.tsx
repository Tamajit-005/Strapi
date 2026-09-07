"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaTwitter, FaGithub, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full min-h-screen bg-black text-gray-300 py-12 px-4"
    >
      <div className="max-w-3xl mx-auto bg-zinc-900 rounded-2xl border border-white/5 shadow-lg p-6 md:p-10">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-6 text-center">
          Contact Us
        </h1>

        <p className="text-gray-400 mb-8 text-center">
          Have a question or want to collaborate? Fill out the form below or
          email us at{" "}
          <a
            href="mailto:tamajitsaha05@gmail.com"
            className="text-white font-semibold underline hover:text-gray-300 transition"
          >
            tamajitsaha05@gmail.com
          </a>
          .
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            className="p-3 rounded-lg bg-zinc-800 text-gray-100 placeholder-gray-500 border border-white/5 focus:outline-none focus:border-white/20 transition"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg bg-zinc-800 text-gray-100 placeholder-gray-500 border border-white/5 focus:outline-none focus:border-white/20 transition"
          />

          <textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            className="p-3 rounded-lg bg-zinc-800 text-gray-100 placeholder-gray-500 border border-white/5 focus:outline-none focus:border-white/20 transition resize-vertical"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-white hover:bg-gray-200 text-black font-bold uppercase text-sm tracking-wider px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4 text-gray-500">
            Follow us
          </h2>

          <div className="flex justify-center gap-6">
            <a
              href="https://x.com/tamajitsaha05"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition"
            >
              <FaTwitter size={22} />
            </a>

            <a
              href="https://github.com/Tamajit-005"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition"
            >
              <FaGithub size={22} />
            </a>

            <a
              href="https://www.instagram.com/tamajit005/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition"
            >
              <FaInstagram size={22} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
