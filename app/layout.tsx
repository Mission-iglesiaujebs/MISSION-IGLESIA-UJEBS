import "./globals.css";
import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: site.name, description: site.name };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
