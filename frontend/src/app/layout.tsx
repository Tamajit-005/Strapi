import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  title: "POST PALETTE",
  description:
    "Your go-to resource for all things Strapi—explore best practices, tips, and community insights to elevate your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-color-mode="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
        {/* Analytics and SpeedInsights at the end of body */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
