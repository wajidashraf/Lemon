import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LEMON - Workflow Authoring Platform",
  description: "AI-native workflow authoring and verification platform for domain experts",
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
      <body className="min-h-full flex flex-col">
        {/* Navigation Header */}
        <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍋</span>
            <Link href="/" className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors">
              LEMON
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Workspace
            </Link>
            <Link href="/library" className="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Library
            </Link>
            <a href="#" className="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Help
            </a>
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">v1.0 (POC)</span>
          </div>
        </header>
        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}
