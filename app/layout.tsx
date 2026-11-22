import "./globals.css";
import type { Metadata, Viewport } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.name,
  applicationName: site.shortName,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: site.shortName, statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
