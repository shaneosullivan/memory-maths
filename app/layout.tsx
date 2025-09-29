import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import BuildIdChecker from "@/components/BuildIdChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memory Maths",
  description: "Practice and improve your mental arithmetic skills with Learning, Practice, and Test phases",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-180.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Memory Maths",
    description: "Practice and improve your mental arithmetic skills with Learning, Practice, and Test phases",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Memory Maths Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Memory Maths",
    description: "Practice and improve your mental arithmetic skills with Learning, Practice, and Test phases",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0066ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Memory Maths" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProvider>
          {children}
        </AppProvider>
        <ServiceWorkerRegistration />
        <BuildIdChecker />
      </body>
    </html>
  );
}
