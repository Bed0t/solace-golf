import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solace Golf",
  description: "A new culture of carry.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Solace Golf",
    description: "A new culture of carry.",
    type: "website",
    url: "https://solace.golf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${montserrat.variable} antialiased bg-white text-neutral-900`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
