import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roamory",
  description: "AI travel planning that becomes a personal travel diary.",
  applicationName: "Roamory",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "Roamory",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#BFE8FA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
