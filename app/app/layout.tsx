import type { Metadata } from "next";
import { Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pipelight",
  description: "AI-powered pipeline monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster richColors position="bottom-left" />
        </AuthProvider>
      </body>
    </html>
  );
}
