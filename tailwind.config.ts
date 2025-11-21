import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        blue: {
          primary: "#0D6EFD",
        },
        // 60-30-10 Color System
        // Main colors (60% usage - backgrounds, large areas)
        main: {
          white: "#FFFFFF",
          lightGrey: "#F5F5F5",
          background: "#FAFAFA",
        },
        // Secondary colors (30% usage - cards, sections)
        secondary: {
          charcoal: "#2C2C2C",
          darkGrey: "#424242",
          mediumGrey: "#757575",
          lightGrey: "#E0E0E0",
        },
        // Accent color (10% usage - CTAs, highlights, important elements)
        pink: {
          primary: "#FF1744", // Main accent
          light: "#FF4569",
          dark: "#E01038",
          background: "#FFE8ED",
        },
        // Complementary colors for specific uses
        navy: {
          primary: "#1A237E",
          light: "#3949AB",
          dark: "#0D1B5E",
        },
        gold: {
          primary: "#FFB300",
          light: "#FFC107",
          dark: "#FF8F00",
        },
        // Keep orange for backward compatibility
        orange: {
          background: "#FF1744",
          hover: "#E01038",
          primary: "#FF1744",
          seconadry: "#E01038",
          border: "#FFE8ED",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        home: "url(/public/assets/images/home-wallpaper.webp)",
      },
      transitionTimingFunction: {
        "bezier-1": "cubic-bezier(.645,.045,.355,1)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
