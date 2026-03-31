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
          {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostHogIdentifier />
            <ModalProvider>{children}</ModalProvider>
            <Toaster />
          </ThemeProvider> */}

         <div class="flex items-center justify-center min-h-[400px] p-4">
  <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
    
    <div class="flex flex-col space-y-1.5 p-6">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive text-red-500">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 class="font-semibold leading-none tracking-tight text-xl">Something went wrong</h3>
      </div>
    </div>

    <div class="p-6 pt-0">
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        If you're a developer, please check your settings. We’re working on it and hope to be back soon.
      </p>
    </div>

    <div class="flex items-center p-6 pt-0">
      <button onclick="window.location.reload()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 h-9 px-4 py-2 w-full dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
        Try Again
      </button>
    </div>
    
  </div>
</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
