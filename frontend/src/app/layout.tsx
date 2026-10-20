import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "POST PALETTE",
  description:
    "Your go-to resource for modern web development — explore best practices, tips, and community insights to elevate your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-25.75">{children}</main>
        <Footer />
        <Toaster />
        {/* Analytics and SpeedInsights at the end of body */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
