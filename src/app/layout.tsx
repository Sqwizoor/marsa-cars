// Next.js
import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import type { ReactNode } from "react";
// Global CSS
import "./globals.css";

//Clerk Imports
import { ClerkProvider } from "@clerk/nextjs";
//toast imports
import { Toaster } from "@/components/ui/toaster";
import ModalProvider from "./providers/modal-provider";
import { PostHogIdentifier } from "@/components/analytics/PostHogIdentifier";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "700"], // Adjust weights as needed
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joumase Cars",
  description: "All Your Car parts and cars for sale at a discounted rate",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} ${inter.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostHogIdentifier />
            <ModalProvider>{children}</ModalProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
