"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaInstagram, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

/* Reference sans (Neue Montreal) is proprietary — closest system stack. */
const TITLE_FONT = "font-[Helvetica_Neue,Helvetica,Arial,sans-serif]";
const LABEL = "font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase text-white/50";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/tamajit005/", Icon: FaInstagram },
  { label: "GitHub", href: "https://github.com/Tamajit-005", Icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tamajit05", Icon: FaLinkedin },
  { label: "Twitter", href: "https://x.com/tamajitsaha05", Icon: FaXTwitter },
];

const field =
  "mt-2 w-full rounded-[18px] border border-white/25 bg-transparent text-[17px] text-white outline-none transition-colors duration-200 placeholder:text-white/35 hover:border-white/50 focus:border-white";

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
        throw new Error(data.error || "Failed to send message.");
      }

      toast.success("Message sent.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

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
            <p className={LABEL}>Contact</p>
            <h1
              className={`${TITLE_FONT} mt-4 text-[35px] leading-8.25 font-bold tracking-[-0.02em] uppercase md:text-[50px] md:leading-11.75 md:tracking-[-1px]`}
            >
              Contact us
            </h1>
          </div>
          <p className="max-w-155 text-[18px] leading-7 text-white/70">
            Have a question or want to collaborate? Send a note below, or email us directly. We
            read every message.
          </p>
        </header>

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-[1fr_1.4fr]">
          {/* Direct contact + socials */}
          <aside>
            <p className={LABEL}>Email</p>
            <p
              className={`${TITLE_FONT} mt-3 inline-block text-[20px] leading-6 font-semibold tracking-[-0.01em] break-all text-white md:text-[24px] md:leading-7`}
            >
              tamajitsaha05@gmail.com
            </p>

            <p className={`${LABEL} mt-12`}>Follow</p>
            <div className="mt-4 border-t border-white/15">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border-b border-white/15 py-3.5 transition-colors duration-200 hover:text-white/60"
                >
                  <Icon size={18} />
                  <span className="font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </aside>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            aria-busy={loading}
            className="rounded-2xl border border-white/15 bg-white/3 p-6 md:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={LABEL}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={100}
                  className={`${field} h-14 px-3.5`}
                />
              </div>

              <div>
                <label htmlFor="email" className={LABEL}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`${field} h-14 px-3.5`}
                />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="message" className={LABEL}>
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What would you like to talk about?"
                required
                minLength={10}
                maxLength={5000}
                rows={7}
                className={`${field} resize-vertical p-4`}
              />
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="font-serif text-[12px] leading-3.75 tracking-[0.01em] text-white/40 uppercase">
                All fields required
              </p>
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center rounded-full bg-white px-6 font-serif text-[13px] leading-3.75 tracking-[0.01em] text-black uppercase transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
