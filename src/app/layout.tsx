import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import ConditionalBotpress from "@/components/conditional-botpress";
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
  title: "KacaMeta - Toko Kacamata Online",
  description: "Toko kacamata online terpercaya dengan koleksi premium dan pelayanan terbaik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
          <ConditionalBotpress />
        </AuthProvider>
      </body>
    </html>
  );
}
