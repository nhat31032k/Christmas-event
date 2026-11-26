import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixel",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-mono-vn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thiệp Giáng Sinh Anime Pixel Art ✨",
  description:
    "Thiệp Giáng Sinh điện tử nhiều slide phong cách Anime Pixel Art 32-bit dành tặng người yêu.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${pixelifySans.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
