import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import PhotoInitializer from "@/components/PhotoInitializer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-ins-serif",
  subsets: ["latin"],
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "Abhi Venkat",
  description: "GOAT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-screen">
      <body
        className={`
          h-full flex flex-col
          ${geistSans.variable} ${geistMono.variable} ${inter.variable} ${serif.variable}
          antialiased
        `}
      >
        <PhotoInitializer />

        <div className="flex-1 min-h-0">
          {children}
        </div>
      </body>
    </html>
  );
}
