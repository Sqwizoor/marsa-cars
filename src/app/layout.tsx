// Next.js
import type { Metadata } from "next";
import Script from "next/script";
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
import ConvexClientProvider from "./providers/convex-client-provider";
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
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s);
fbq('init', '1121730653781517');
fbq('track', 'PageView');
}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1121730653781517&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostHogIdentifier />
            <ConvexClientProvider>
              <ModalProvider>{children}</ModalProvider>
            </ConvexClientProvider>
            <Toaster />
          </ThemeProvider>

          {/* <p> Opse not active</p> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
