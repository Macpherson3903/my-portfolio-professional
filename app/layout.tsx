import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMetadataBase, getPublicSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getPublicSiteUrl();

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: siteUrl,
  },
  title: {
    default: "Macpherson Dieze | Full Stack Developer",
    template: "%s | Macpherson Dieze",
  },
  description:
    "Full Stack Developer specializing in building scalable web applications using React, Next.js, and modern technologies.",
  keywords: [
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Web Developer",
    "JavaScript",
    "Portfolio",
  ],
  authors: [{ name: "Macpherson Dieze" }],
  creator: "Macpherson Dieze",
  openGraph: {
    title: "Macpherson Dieze | Full Stack Developer",
    description:
      "Building scalable and high-performance web applications with modern technologies.",
    url: siteUrl,
    siteName: "Macpherson Portfolio",
    images: [
      {
        url: "/assets/hero-img.webp",
        width: 1200,
        height: 630,
        alt: "Macpherson Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Macpherson Dieze | Full Stack Developer",
    description:
      "Full Stack Developer crafting modern, scalable web applications.",
    images: ["/assets/hero-img.webp"],
    creator: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white font-mono`}
      >
        {children}
      </body>
    </html>
  );
}