import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipFinder",
  description: "Find small video clips for your edits by describing what you need."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}