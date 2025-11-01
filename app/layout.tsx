import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGCMS - Amazing Grace Church Management System",
  description: "Church member management system for Amazing Grace Baptist Church",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


