import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KU Smart Lost & Found — Powered by AI",
  description:
    "AI-powered centralized Lost & Found platform for Kasetsart University. Report and find items using CLIP image matching and semantic text search.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
