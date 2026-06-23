import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Site Visit Scheduler",
  description:
    "A weekly field-visit planner for Metro Manila: traffic-aware routing, number-coding awareness, and a drag-and-drop board. No backend — runs entirely in the browser.",
  openGraph: {
    title: "Site Visit Scheduler",
    description:
      "An interactive weekly planner for scheduling field visits across Metro Manila — traffic-aware travel times, vehicle-coding awareness, and drag-and-drop scheduling.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
