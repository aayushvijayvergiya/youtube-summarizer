import type { Metadata } from "next";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "@/components/Header/Header";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youtube Summarizer",
  description: "Youtube Summarizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Head>
          <title>YouTube Summarizer</title>
          <meta name="description" content="Summarize YouTube videos easily" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header />
        <AuthProvider>
          {children}
        </AuthProvider>
        
        <Toaster position="top-center" />

        <footer className="py-6  border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">
            <p>© {new Date().getFullYear()} YouTube Summarizer</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
